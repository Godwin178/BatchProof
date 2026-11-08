// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BatchProofRegistry
 * @notice On-chain registry of batch fingerprints for the BatchProof
 * traceability platform, targeting Arbitrum Sepolia.
 *
 * Only a keccak256 fingerprint of a batch record is stored here. No producer
 * names, origins, dates, descriptions or any other business information ever
 * enters this contract. The application computes the hash off-chain and the
 * registry simply proves that a given hash existed at a given time, issued by
 * an authorised registrar.
 */
contract BatchProofRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Anchor {
        address issuer;
        uint64 timestamp;
    }

    mapping(bytes32 => Anchor) private _anchors;

    event BatchAnchored(bytes32 indexed batchHash, address indexed issuer, uint64 timestamp);

    error EmptyHash();
    error AlreadyAnchored();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    /**
     * @notice Anchor a batch fingerprint. Reverts if the hash is empty or has
     * already been anchored, so an anchored record can never be overwritten.
     */
    function anchorBatch(bytes32 batchHash) external onlyRole(REGISTRAR_ROLE) {
        if (batchHash == bytes32(0)) revert EmptyHash();
        if (_anchors[batchHash].timestamp != 0) revert AlreadyAnchored();

        _anchors[batchHash] = Anchor({issuer: msg.sender, timestamp: uint64(block.timestamp)});
        emit BatchAnchored(batchHash, msg.sender, uint64(block.timestamp));
    }

    /// @notice True when the fingerprint has been anchored before.
    function isAnchored(bytes32 batchHash) external view returns (bool) {
        return _anchors[batchHash].timestamp != 0;
    }

    /// @notice When the fingerprint was anchored and by whom.
    function getAnchor(bytes32 batchHash) external view returns (address issuer, uint64 timestamp) {
        Anchor memory anchor = _anchors[batchHash];
        return (anchor.issuer, anchor.timestamp);
    }
}
