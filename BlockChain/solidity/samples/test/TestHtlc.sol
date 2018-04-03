pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/HTLC.sol";

contract TestHtlc {
  function testPay() public {
    HTLC htlc = HTLC(DeployedAddresses.HTLC());
    bytes32 image = hex"000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
    htlc.pay(image);
  }
}
