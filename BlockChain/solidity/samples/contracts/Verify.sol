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
    
    // Remix test string: "0x3e2d111c8c52a5ef0ba64fe4d85e32a5153032367ec44aaae0a4e2d1bfb9bebd", "0x20a95c0ddc1483ac6f87f18dca5956df254faa0b", "0xb4c88ef2b5d41d0e3014bda4a6df62c40a575b40", ["0x9a","0x5f","0x6c","0x3d","0x90","0xed","0xf0","0x59","0x44","0x1a","0x50","0xf2","0xb8","0xad","0x50","0x35","0xd0","0x54","0xa6","0x18","0xa3","0x2f","0xf6","0xcb","0x76","0x72","0x9e","0xa8","0x40","0xaf","0xa7","0x74","0x3c","0xd6","0x1a","0xa6","0x67","0xf0","0xe7","0x27","0x7d","0x81","0x2f","0x1d","0x96","0xa7","0x95","0xca","0x86","0xa8","0x81","0x50","0x0d","0x9c","0x76","0xa9","0x37","0x63","0x0d","0x5c","0xa8","0x4c","0x1c","0xc4","0x1c"], ["0xf7","0xae","0x2b","0x6f","0xa2","0xa0","0xc5","0xad","0xad","0x96","0x03","0x21","0xe6","0x20","0x11","0x09","0x52","0xa8","0x7e","0x67","0xf8","0x55","0xb6","0x23","0x0c","0x2d","0xee","0x36","0xfa","0xe7","0x12","0x46","0x79","0x18","0xb3","0xc3","0x0f","0x51","0x6b","0xc7","0x8a","0x5b","0x01","0x8a","0x00","0x77","0x83","0x93","0xc1","0xde","0xfb","0x58","0x0c","0xa9","0x06","0x5b","0x4c","0x57","0x52","0xa0","0x30","0xf8","0x2b","0x0d","0x1c"]
    function verify(bytes32 hash, address addr1, address add2, bytes sig1, bytes sig2) external {
        assembly {
            function f(a) -> y {
                if eq(call(gas, 0x1, 0, 0xA0, 0x80, 0x120, 0x20), 0) {
                    revert(0, 0)
                }
                jumpi(pass, eq(mload(0x120), mload(a)))
                revert(0, 0)
                pass:
            }
            calldatacopy(0x60, 0x24, 0x20) // Address 1
            calldatacopy(0x80, 0x44, 0x20) // Address 2
            calldatacopy(0xA0, 4, 0x20) // Hash. Starting address
            mstore(0xC0, byte(0, calldataload(0x104))) // v
            calldatacopy(0xE0, 0xC4, 0x20) // R
            calldatacopy(0x100, 0xE4, 0x20) // S
            let r := f(0x60)
            mstore(0xC0, byte(0, calldataload(0x184))) // v
            calldatacopy(0xE0, 0x144, 0x20) // R
            calldatacopy(0x100, 0x164, 0x20) // S
            r := f(0x80)
        }
    }
}
