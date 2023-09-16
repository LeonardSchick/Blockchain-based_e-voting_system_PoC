// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./EllipticCurve.sol";

library Secp256k1 {

    uint256 public constant GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint256 public constant GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
    uint256 public constant AA = 0;
    uint256 public constant BB = 7;
    uint256 public constant PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;

    /// @dev Multiply point (x, y, z) times d.
    /// @param _d scalar to multiply
    /// @param _P jacobian point
    /// @return (qx, qy, qz) d*P in Jacobian
    function multiply(uint256 _d, uint256[3] memory _P) pure public returns (uint256[3] memory){
        uint256[3] memory point;
        (point[0], point[1], point[2]) = EllipticCurve.jacMul(_d, _P[0], _P[1], _P[2], AA, PP);
        return point;
    }

    function jacobianAdd(uint256[3] memory _p1, uint256[3] memory _p2) pure public returns (uint256[3] memory){
        uint256[3] memory sum;
        (sum[0], sum[1], sum[2]) = EllipticCurve.jacAdd(_p1[0], _p1[1], _p1[2],_p2[0], _p2[1], _p2[2], PP);
        return sum;
    }
    
    function jacobianToAffine(uint256[3] memory _p) pure public returns (uint256[2] memory){
        uint256[2] memory affineP;
        (affineP[0], affineP[1]) = EllipticCurve.toAffine(_p[0], _p[1], _p[2], PP);
        return affineP;
    }

    function uintToString(uint v) internal pure returns (string memory str) {
        uint maxlength = 78;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
        uint remainder = v % 10;
        v = v / 10;
        reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
        s[j] = reversed[i - 1 - j];
        }
        str = string(s);
    }

    function add(uint256 x1, uint256 y1,uint256 x2, uint256 y2 ) pure public returns (uint256, uint256) {
        return EllipticCurve.ecAdd(x1,y1,x2,y2,AA,PP);
    }

    function invMod(uint256 val, uint256 p) pure public returns (uint256){
        return EllipticCurve.invMod(val,p);
    }

    function expMod(uint256 val, uint256 e, uint256 p) pure public returns (uint256){
        return EllipticCurve.expMod(val,e,p);
    }

    function getY(uint8 prefix, uint256 x) pure public returns (uint256){
        return EllipticCurve.deriveY(prefix,x,AA,BB,PP);
    }

    function onCurve(uint256 x, uint256 y) pure public returns (bool){
        return EllipticCurve.isOnCurve(x,y,AA,BB,PP);
    }

    function inverse(uint256 x, uint256 y) pure public returns (uint256, uint256) {
        return EllipticCurve.ecInv(x,y,PP);
    }

    function subtract(uint256 x1, uint256 y1,uint256 x2, uint256 y2 ) pure public returns (uint256, uint256) {
        return EllipticCurve.ecSub(x1,y1,x2,y2,AA,PP);
    }

    function derivePubKey(uint256 privKey) pure public returns (uint256, uint256) {
        return EllipticCurve.ecMul(privKey,GX,GY,AA,PP);
    }
    
}
