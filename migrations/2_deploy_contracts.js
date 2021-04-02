//import smart contracts
var UserManagement = artifacts.require("./UserManagement.sol");
var ProductManagement = artifacts.require("./ProductManagement.sol");

//deploy smart contracts
module.exports = function (deployer) {
    deployer.deploy(UserManagement);
    deployer.deploy(ProductManagement);
};
