var HTLC = artifacts.require("./HTLC.sol");
var Verify = artifacts.require("./Verify.sol");

module.exports = function(deployer) {
  deployer.deploy(HTLC);
  deployer.deploy(Verify);
};
