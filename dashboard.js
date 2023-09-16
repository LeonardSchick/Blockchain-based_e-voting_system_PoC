let web3;
if (typeof window.ethereum !== 'undefined') 
	web3 = new Web3(window.ethereum);


const contractAddress = "0xbE15543f7FDafEA0ACbFF648D8398f6c2fB5188c";
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rate",
				"type": "uint256"
			}
		],
		"name": "changeRatelimit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "optionNames",
				"type": "string[]"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "createPoll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "enabled",
				"type": "bool"
			}
		],
		"name": "ratelimiterSwitch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "pollId",
				"type": "uint256"
			}
		],
		"name": "removePoll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256[2]",
				"name": "pubKey",
				"type": "uint256[2]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "pollId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "PollCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "pollId",
				"type": "uint256"
			}
		],
		"name": "PollRemoved",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "revokeVotingRight",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "c",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "s",
				"type": "uint256"
			}
		],
		"name": "verifyBlindSig",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "pollId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "option",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "pollId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "option",
				"type": "uint256"
			}
		],
		"name": "VoteCast",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "pollId",
				"type": "uint256"
			}
		],
		"name": "voteTally",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "optionNames_",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "voteCounts_",
				"type": "uint256[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "generatorPoint",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pollCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "polls",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pollStart",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pollEnd",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pubKeyOfOrganizer",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "voters",
		"outputs": [
			{
				"internalType": "bool",
				"name": "voteRight",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "lastReq",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; 
const contract = initializeContract();



function initializeContract() {
    if (typeof window.ethereum !== 'undefined') {
		const contract = new web3.eth.Contract(contractABI, contractAddress);
		return contract;
    } else {
		console.error("Ethereum provider (e.g., MetaMask) not detected");
    }
}

async function verifyBlindSignature(r, s) {
	try {
		// Request access to user's Ethereum accounts
		await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Get the current user's account
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];
		
        // Send the transaction
        const receipt = await contract.methods.verifyBlindSig(r, s).send({ from: currentAccount });
        console.log('Transaction receipt:', receipt);
    } catch (error) {
		console.error('Error sending transaction:', error);
    }
}

async function castVote(pollId, option) {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        const receipt = await contract.methods.vote(pollId, option).send({ from: currentAccount });
        console.log('Transaction receipt:', receipt);
    } catch (error) {
        console.error('Error sending vote transaction:', error);
    }
}

//starttime and endtime are in unix time
async function createPoll(optionNames, startTime, endTime) {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        const receipt = await contract.methods.createPoll(optionNames, startTime, endTime).send({ from: currentAccount });
        console.log('Transaction receipt:', receipt);
    } catch (error) {
        console.error('Error sending create poll transaction:', error);
    }
}

async function getPoll(pollId) {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const result = await contract.methods.voteTally(pollId).call();
        const optionNames = result[0];
        const voteCounts = result[1];
        
        return {optionNames, voteCounts};

    } catch (error) {
        console.error('Error retrieving vote tally:', error);
    }
}

async function getPollCounter() {
    try {
        const counter = await contract.methods.pollCounter().call();
        return counter;
    } catch (error) {
        console.error('Error fetching pollCounter:', error);
    }
}

async function updatePollTally(pollId) {
    // Get the updated vote counts for the poll
    const updatedPollData = await getPoll(pollId);

    // Find the specific poll card for the given pollId
    const pollCard = document.querySelector(`.poll-card[data-poll-id="${pollId}"]`);
    const optionsDiv = pollCard.querySelector('.poll-options');

    // Update the displayed vote counts for all options within the poll
    updatedPollData.optionNames.forEach((name, idx) => {
        const optionId = 'option' + idx + '-poll' + pollId;
        const optionLabel = optionsDiv.querySelector('label[for="' + optionId + '"]');
        optionLabel.innerText = name + " (" + updatedPollData.voteCounts[idx] + " votes)";
    });
}

//dateString format "DD-MM-YYYY"
function dateTimeToUnix(dateString, timeString = "00:00") {
    // Split the date and time strings into their components
    const [day, month, year] = dateString.split("-");
    const [hour, minute] = timeString.split(":");

    // Create a Date object using the components
    const dateObj = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,  // Months are 0-indexed in JavaScript
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
    ));

    // Convert Date object to a Unix timestamp
	//subtract 2 hours when in UTC+2 to get timestamp in UTC
	//this is done due to block.timestamp on ethereum being in UTC 
    return Math.floor(dateObj.getTime() / 1000) - (2 * 60 * 60);
}

//TODO: implement AES decryption of the keystore before using web3 to decrypt
async function getWallet(password) {
}


document.querySelectorAll('.poll-card').forEach(card => {
	card.addEventListener('click', () => {
		const options = card.querySelector('.poll-options');
		options.style.display = options.style.display === 'none' ? 'block' : 'none';
	});
});

async function submitCreatePoll() {
	try {
		const option1 = document.getElementById('option1').value;
		const option2 = document.getElementById('option2').value;
		const option3 = document.getElementById('option3').value;

		const startDate = document.getElementById('startDate').value;
		const startTime = document.getElementById('startTime').value;
		const endDate = document.getElementById('endDate').value;
		const endTime = document.getElementById('endTime').value;

		const start = dateTimeToUnix(startDate, startTime);
		const end = dateTimeToUnix(endDate, endTime);
		const options = [option1, option2, option3];
		console.log("options:" + options);
		console.log("start: " + start);
		console.log("end: " + end);
		
		await createPoll(options, start, end);

	} catch (error) {
		console.error('Error sending transaction: createPoll:', error);
    }
}

async function displayPolls() {
    const pollCount = await getPollCounter();

    // Clear any existing poll cards first
    const pollContainer = document.getElementById('poll-container');
    pollContainer.innerHTML = '';

    for (let i = 0; i < pollCount; i++) {
        const pollDetails = await getPoll(i);
        
        // Create a new poll card
        const pollCard = document.createElement('div');
        pollCard.className = 'poll-card';
        pollCard.style.border = '2px solid gray';
				
        // Poll title and description
        const pollTitle = document.createElement('h3');
        pollTitle.innerText = "Poll " + (i + 1);  // This is a placeholder. You might have a function to fetch the actual title.
        pollCard.appendChild(pollTitle);

        const pollDesc = document.createElement('p');
        pollDesc.innerText = "Choose your option...";  // Placeholder description
        pollCard.appendChild(pollDesc);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'poll-options';

        for (let j = 0; j < pollDetails.optionNames.length; j++) {
            const optionInput = document.createElement('input');
            optionInput.type = 'radio';
            optionInput.id = 'option' + j + '-poll' + i;
            optionInput.name = 'poll' + i;

            const optionLabel = document.createElement('label');
            optionLabel.htmlFor = optionInput.id;
            optionLabel.innerText = pollDetails.optionNames[j] + " (" + pollDetails.voteCounts[j] + " votes)";

            optionsDiv.appendChild(optionInput);
            optionsDiv.appendChild(optionLabel);
            optionsDiv.appendChild(document.createElement('br'));
        }

        const voteButton = document.createElement('button');
        voteButton.className = 'button';
        voteButton.innerText = 'Vote';
        voteButton.addEventListener('click', async function() {
			const selectedOption = optionsDiv.querySelector('input[type="radio"]:checked');
			if (selectedOption) {
				//extract the option index based on the id ("option2-poll1" => "2")
				const optionIndex = parseInt(selectedOption.id.split('-')[0].replace('option', ''));
				await castVote(i, optionIndex);
				//await updatePollTally(i);
			} else {
				console.error("No option selected.");
			}
		});
		

        optionsDiv.appendChild(voteButton);

        pollCard.appendChild(optionsDiv);
        pollContainer.appendChild(pollCard);
    }
}




document.addEventListener('DOMContentLoaded', displayPolls);
