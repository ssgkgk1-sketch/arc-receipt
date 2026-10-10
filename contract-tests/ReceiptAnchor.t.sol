// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {ReceiptAnchor} from '../contracts/ReceiptAnchor.sol';
contract Publisher {
    function publish(ReceiptAnchor a, bytes32 t, bytes32 d) external { a.anchor(t,d); }
}
contract ReceiptAnchorTest {
    function testStoresDigest() public {
        ReceiptAnchor a = new ReceiptAnchor();
        a.anchor(bytes32(uint256(1)), bytes32(uint256(2)));
        require(a.reportDigest(address(this),bytes32(uint256(1))) == bytes32(uint256(2)));
    }
    function testCannotOverwrite() public {
        ReceiptAnchor a = new ReceiptAnchor();
        a.anchor(bytes32(uint256(1)),bytes32(uint256(2)));
        (bool ok,) = address(a).call(abi.encodeCall(a.anchor,(bytes32(uint256(1)),bytes32(uint256(3)))));
        require(!ok);
    }
    function testPublishersIsolated() public {
        ReceiptAnchor a = new ReceiptAnchor();
        Publisher p = new Publisher();
        a.anchor(bytes32(uint256(1)),bytes32(uint256(2)));
        p.publish(a,bytes32(uint256(1)),bytes32(uint256(3)));
        require(a.reportDigest(address(this),bytes32(uint256(1))) == bytes32(uint256(2)));
        require(a.reportDigest(address(p),bytes32(uint256(1))) == bytes32(uint256(3)));
    }
    function testRejectsEmptyHash() public {
        ReceiptAnchor a = new ReceiptAnchor();
        (bool ok,) = address(a).call(abi.encodeCall(a.anchor,(bytes32(0),bytes32(uint256(3)))));
        require(!ok);
    }
    function testRejectsEmptyDigest() public {
        ReceiptAnchor a = new ReceiptAnchor();
        (bool ok,) = address(a).call(abi.encodeCall(a.anchor,(bytes32(uint256(1)),bytes32(0))));
        require(!ok);
    }
    function testFuzzStoresExactDigest(bytes32 t, bytes32 d) public {
        if (t == bytes32(0) || d == bytes32(0)) return;
        ReceiptAnchor a = new ReceiptAnchor();
        a.anchor(t,d);
        require(a.reportDigest(address(this),t) == d);
    }
}
