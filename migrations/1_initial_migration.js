const Voting = artifacts.require("Voting");
const VoterIdentityNFT = artifacts.require("VoterIdentityNFT");

module.exports = async function (deployer) {
  await deployer.deploy(VoterIdentityNFT);
  const identity = await VoterIdentityNFT.deployed();
  await deployer.deploy(Voting, identity.address);
};
