/* Typical assembly for empty contract and function
contract c { f() {} }
.code
    PUSH1 0x60          // Push 0x60 into stack
    PUSH1 0x40          // Push 0x40 into stack
    MSTORE              // mstore(0x40, 0x60) - Store value 0x60 in address 0x40. Used as a pointer to the next memory address that can be used for writing
    PUSH1 0x1E          // Body code length
    DUP1 
    PUSH1 0x10      PUSH1 0x0 
    CODECOPY            // codecopy(memoryOffset, codeOffset, codeLength). copy all the code after the RETURN statement
    PUSH1 0x0           
    RETURN              // init return
.data                   // Body part
    PUSH1 0x60      PUSH1 0x40      MSTORE 
    PUSH1 0xE0      PUSH1 0x2 
    EXP                 // To get a number to devide
    PUSH1 0x0 
    CALLDATALOAD        // calldataload(p). call data starting from position p (32 bytes)
    DIV                 // Devide by a number to get first 4 bytes to be used as a function id
    PUSH4 0x26121FF0    // Some precomputed value as the funciton id
    DUP2 EQ
    PUSH1 0x1A 
    JUMPI               // jumpi(label, cond). jump to label if cond is nonzero
    JUMPDEST 
    STOP 
    JUMPDEST 
    PUSH1 0x18 
    JUMP
(Above: 1. Get first 32 bytes of calldata 2. Get the first 4 bytes 3. Compare with funciton id
        4. continue or stops if the id not match)
*/
