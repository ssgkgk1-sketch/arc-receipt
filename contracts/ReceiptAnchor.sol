// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/// @notice Timestamped publisher claims, NOT onchain verification of payments.
/// @dev No custody, token approvals, external calls, owner, or upgrade mechanism.
contract ReceiptAnchor {
    mapping(address => mapping(bytes32 => bytes32)) public reportDigest;
    event Anchored(address indexed publisher, bytes32 indexed paymentTxHash, bytes32 digest);
    error EmptyValue();
    error AlreadyAnchored();

    /// @param digest SHA-256 of the exact offchain JSON report bytes.
    /// @dev One immutable claim per publisher/payment, not globally exclusive.
    function anchor(bytes32 paymentTxHash, bytes32 digest) external {
        if (paymentTxHash == bytes32(0) || digest == bytes32(0)) revert EmptyValue();
        if (reportDigest[msg.sender][paymentTxHash] != bytes32(0)) revert AlreadyAnchored();
        reportDigest[msg.sender][paymentTxHash] = digest;
        emit Anchored(msg.sender, paymentTxHash, digest);
    }
}
