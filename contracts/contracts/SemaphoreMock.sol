// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SemaphoreMock {
    uint256 private nextGroupId = 1;

    function createGroup(address) external returns (uint256) {
        return nextGroupId++;
    }

    function addMember(uint256, uint256) external {}

    function validateProof(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256[8] calldata
    ) external pure {}
}