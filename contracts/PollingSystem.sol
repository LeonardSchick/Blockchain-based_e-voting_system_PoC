// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import {Secp256k1} from "./Secp256k1.sol";

contract PollingSystem {
    struct Voter {
        bool voteRight;
        mapping(uint => uint) vote;
        mapping(uint => bool) hasVoted; //pollId => bool
        uint lastReq;
    }

    struct Option {
        uint id;
        string name;
        uint voteCount;
    }

    struct Poll {
        uint id;
        uint pollStart;
        uint pollEnd;
        Option[] options;
    }

    address public admin;
    uint public pollCounter;
    mapping(uint => Poll) public polls;
    mapping(address => Voter) public voters;
    bool ratelimiterEnabled;
    uint RATELIMIT;     //unix time

    event VoteCast(uint indexed pollId, address indexed voter, uint indexed option);
    event PollCreated(uint indexed pollId, uint startTime, uint endTime);
    event PollRemoved(uint indexed pollId);

    uint256[3] public pubKeyOfOrganizer;
    //constants used in ECC operations
    uint256[3] public generatorPoint;
    uint constant n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;
    uint constant p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f;
    
    constructor(uint[2] memory pubKey) {
        admin = msg.sender;

        //(pubKeyOfOrganizer[0], pubKeyOfOrganizer[1]) = affine(x, y) of the organizers public key
        pubKeyOfOrganizer[0] = pubKey[0];
        pubKeyOfOrganizer[1] = pubKey[1];
        pubKeyOfOrganizer[2] = 1;

        generatorPoint[0] = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
        generatorPoint[1] = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
        generatorPoint[2] = 1;    
    }

    modifier onlyAdmin(){
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyDuringPollPeriod(uint pollId) {
        require(block.timestamp >= polls[pollId].pollStart && block.timestamp <= polls[pollId].pollEnd,
                "Cannot vote outside of poll period");
        _;
    }

    modifier ratelimiter(address sender){
        if(ratelimiterEnabled){
            require(block.timestamp >= voters[sender].lastReq + RATELIMIT, "Ratelimited: Too many requests");
            voters[sender].lastReq = block.timestamp;
        }
        _;
    }

    //Admin functions
    function ratelimiterSwitch(bool enabled) public onlyAdmin{
        ratelimiterEnabled = enabled;
    }

    function changeRatelimit(uint rate) public onlyAdmin{
        RATELIMIT = rate;
    }
    
    function createPoll(string[] memory optionNames, uint startTime, uint endTime) public onlyAdmin {
        Poll storage newPoll = polls[pollCounter];
        newPoll.id = pollCounter++;
        newPoll.pollStart = startTime;
        newPoll.pollEnd = endTime;

        for(uint i = 0; i < optionNames.length; i++) {
            newPoll.options.push(Option(i, optionNames[i], 0));
        }
        emit PollCreated(newPoll.id, startTime, endTime);
    }
    
    function removePoll(uint pollId) public onlyAdmin {
        require(polls[pollId].id == pollId, "Invalid poll ID");
        delete polls[pollId];
        emit PollRemoved(pollId);
    }

    function revokeVotingRight(address voter) public onlyAdmin{
        voters[voter].voteRight = false;
    }

    //User functions
    function getVotingRights(uint256 c, uint256 s) public ratelimiter(msg.sender) {
        string memory voter = Strings.toHexString(uint256(uint160(msg.sender)), 20);

        uint[3] memory cP = Secp256k1.multiply(c,pubKeyOfOrganizer);
        uint[3] memory sG = Secp256k1.multiply(s, generatorPoint);
        uint[3] memory sum = Secp256k1.jacobianAdd(cP, sG); //convert the x coordinate from Jacobian to affine coordinate before projecting the x coordinate
        uint[2] memory affineSum = Secp256k1.jacobianToAffine(sum);
        uint projection = affineSum[0] % n;
        
        uint cVerify = uint(keccak256(abi.encodePacked(voter, Secp256k1.uintToString(projection)))); 
        require(c == cVerify, "Invalid Signature");
        voters[msg.sender].voteRight = true;
    }

    function vote(uint pollId, uint option) public onlyDuringPollPeriod(pollId) ratelimiter(msg.sender){
        Voter storage sender = voters[msg.sender];

        require(sender.voteRight, "Has no right to vote");
        require(polls[pollId].id == pollId, "Invalid poll ID");
        require(option >= 0 && option< polls[pollId].options.length, "Invalid optionID");
        
        //if they have already voted, remove prior vote before adding new one
        if(sender.hasVoted[pollId]){
            polls[pollId].options[sender.vote[pollId]].voteCount -= 1;    
        }

        sender.hasVoted[pollId] = true;
        sender.vote[pollId] = option;
        polls[pollId].options[option].voteCount += 1;
        emit VoteCast(pollId, msg.sender, option);
    }

    function voteTally(uint pollId) public ratelimiter(msg.sender) returns (string[] memory optionNames_, uint[] memory voteCounts_) {
        require(polls[pollId].id == pollId, "Invalid poll ID");
        Poll memory poll = polls[pollId];
        uint pollSize = poll.options.length;
        voteCounts_ = new uint[](pollSize);
        optionNames_ = new string[](pollSize);

        for(uint i = 0; i < pollSize; i++){
            optionNames_[i] = poll.options[i].name;
            voteCounts_[i] = poll.options[i].voteCount;
        }
    }
}

