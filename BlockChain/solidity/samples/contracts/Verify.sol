/*
Can use command "ganache-cli --testrpc" to create test accounts
Use Web3 code to generate signatures:
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  web3.eth.getAccounts(function(error, accounts) {
    // 2nd param is the private key get from testrpc accounts. There should be a 0x prefix
    var signedData = web3.eth.accounts.sign("test message", "0x741f51cbb4fec0883c8b80f6c1558c646807426060378fdb8ffca9eddeff1958");
    console.log(signedData);
  });
Available Accounts
==================
(0) 0x20a95c0ddc1483ac6f87f18dca5956df254faa0b
(1) 0xb4c88ef2b5d41d0e3014bda4a6df62c40a575b40
Private Keys
==================
(0) 3527c0ff37757148d6854152e3c44272ee044408170a22284999be68606dabf7
(1) 741f51cbb4fec0883c8b80f6c1558c646807426060378fdb8ffca9eddeff1958
'test message' = 74657374206d657373616765
{ message: 'test message',
  messageHash: '0x3e2d111c8c52a5ef0ba64fe4d85e32a5153032367ec44aaae0a4e2d1bfb9bebd',
  v: '0x1c',
  r: '0x9a5f6c3d90edf059441a50f2b8ad5035d054a618a32ff6cb76729ea840afa774',
  s: '0x3cd61aa667f0e7277d812f1d96a795ca86a881500d9c76a937630d5ca84c1cc4',
  signature: '0x9a5f6c3d90edf059441a50f2b8ad5035d054a618a32ff6cb76729ea840afa7743cd61aa667f0e7277d812f1d96a795ca86a881500d9c76a937630d5ca84c1cc41c' }
{ message: 'test message',
  messageHash: '0x3e2d111c8c52a5ef0ba64fe4d85e32a5153032367ec44aaae0a4e2d1bfb9bebd',
  v: '0x1c',
  r: '0xf7ae2b6fa2a0c5adad960321e620110952a87e67f855b6230c2dee36fae71246',
  s: '0x7918b3c30f516bc78a5b018a00778393c1defb580ca9065b4c5752a030f82b0d',
  signature: '0xf7ae2b6fa2a0c5adad960321e620110952a87e67f855b6230c2dee36fae712467918b3c30f516bc78a5b018a00778393c1defb580ca9065b4c5752a030f82b0d1c' }*/
pragma solidity ^0.4.16;
contract Verify {
    modifier verify_sig(bytes32 message_hash, bytes sig, address signer) {
      bytes32 r;
      bytes32 s;
      uint8 v;
      
      require(sig.length == 65);
      assembly {
        r := mload(add(sig, 32))
        s := mload(add(sig, 64))
        v := byte(0, mload(add(sig, 96)))
      }
      address addr = ecrecover(message_hash, v, r, s);
      require(signer == addr);
      _;
    }

    function verify(bytes32 message_hash, bytes sig1, address signer1, bytes sig2, address signer2) 
      external verify_sig(message_hash, sig1, signer1) verify_sig(message_hash, sig2, signer2) {
    }
}
