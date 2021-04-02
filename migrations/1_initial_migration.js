const Migrations = artifacts.require("Migrations");

//deploy migrations
module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
