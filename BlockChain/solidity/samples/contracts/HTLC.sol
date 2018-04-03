pragma solidity ^0.4.16;

// 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
// SHA256: 7426ba0604c3f8682c7016b44673f85c5bd9da2fa6c1080810cf53ae320c9863
// SHA3: fe07bfcf888c2aad5f4586a3371ae0b7a23d7829c6142817829ed5f28d381da4
contract HTLC {
    function pay(bytes32 preimage) external {
        //bytes32 p = preimage;
        assembly {
            // Check time
            if gt(timestamp, 0x5ac9e88f) {
                selfdestruct(0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe)
                stop
            }

            //let v := calldataload(4) // Load preimage data. Ignore 4 bytes function id
            //let p := add(msize(), 1) // Save to local
            //mstore(p, v)
            let p := add(msize(), 1)   // msize() to get the current maximum used memory size and add one to get a free memory address
            calldatacopy(p, 4, 32)     // Copy the calldata to memory. 4 bytes is the function id
            let hashed := keccak256(p, 32)
            if eq(hashed, 0xfe07bfcf888c2aad5f4586a3371ae0b7a23d7829c6142817829ed5f28d381da4) {
                selfdestruct(0x7D551397F79A2988B064AFd0EFeBEe802C7721Bc)
                stop
            }
            revert(0, 0)
        }
    }
}