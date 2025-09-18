// migrations/2_deploy_contracts.js

// 1. Import contract artifacts
const UserRegistry = artifacts.require("UserRegistry");
const ProductLedger = artifacts.require("ProductLedger");
const CropInsurance = artifacts.require("CropInsurance");
const LoanMatching = artifacts.require("LoanMatching");

module.exports = async function (deployer,network, accounts) {
  // 2. Deploy the UserRegistry contract first, as it has no dependencies.
  await deployer.deploy(UserRegistry);
  const userRegistry = await UserRegistry.deployed();
  console.log("UserRegistry deployed at:", userRegistry.address);

  // 3. Deploy the other contracts, passing the UserRegistry address to their constructors.
  // This links them together on the blockchain.
  
  await deployer.deploy(ProductLedger, userRegistry.address);
  const productLedger = await ProductLedger.deployed();
  console.log("ProductLedger deployed at:", productLedger.address);

  await deployer.deploy(CropInsurance, userRegistry.address);
  const cropInsurance = await CropInsurance.deployed();
  console.log("CropInsurance deployed at:", cropInsurance.address);

  await deployer.deploy(LoanMatching, userRegistry.address);
  const loanMatching = await LoanMatching.deployed();
  console.log("LoanMatching deployed at:", loanMatching.address);

  // : For testing, you can register a few default users
  // The first account is the owner/admin by default
  const owner = accounts[0];
  console.log("Owner/Admin account:", owner);
  await userRegistry.addBank(accounts[1], "SBI", { from: owner });
  console.log("Bank account added:", accounts[1]);
  await userRegistry.addInsurance(accounts[2], "Insurance Co.", { from: owner });
  console.log("Insurance account added:", accounts[2]);
  await userRegistry.addVerifier(accounts[3], "Charlie Verifier", { from: owner });
  console.log("Verifier account added:", accounts[3]);

  console.log("Default users have been registered for testing.");
};