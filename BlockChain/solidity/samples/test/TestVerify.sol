pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Verify.sol";

contract TestVerify {

  function testVerify() public {
    bytes32 message_hash = hex"3e2d111c8c52a5ef0ba64fe4d85e32a5153032367ec44aaae0a4e2d1bfb9bebd";
    bytes memory sig = hex"9a5f6c3d90edf059441a50f2b8ad5035d054a618a32ff6cb76729ea840afa7743cd61aa667f0e7277d812f1d96a795ca86a881500d9c76a937630d5ca84c1cc41c";
    address signer = 0x20a95c0ddc1483ac6f87f18dca5956df254faa0b;
    bytes memory sig2 = hex"f7ae2b6fa2a0c5adad960321e620110952a87e67f855b6230c2dee36fae712467918b3c30f516bc78a5b018a00778393c1defb580ca9065b4c5752a030f82b0d1c";
    address signer2 = 0xb4c88ef2b5d41d0e3014bda4a6df62c40a575b40;

    Verify verify = Verify(DeployedAddresses.Verify());
    verify.verify(message_hash, sig, signer, sig2, signer2);
  }
}
