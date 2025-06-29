const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Network:", hre.network.name);

  // Deploy Factory
  const TrustInvoiceFactory = await hre.ethers.getContractFactory("TrustInvoiceFactory");
  const factory = await TrustInvoiceFactory.deploy();
  await factory.deployed();
  
  console.log("TrustInvoiceFactory deployed to:", factory.address);

  // Deploy main contract
  const TrustInvoice = await hre.ethers.getContractFactory("TrustInvoice");
  const trustInvoice = await TrustInvoice.deploy(deployer.address);
  await trustInvoice.deployed();
  
  console.log("TrustInvoice deployed to:", trustInvoice.address);

  // Deploy mock tokens for testing
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 1000000);
    await usdc.deployed();
    console.log("Mock USDC deployed to:", usdc.address);
    
    const usdt = await MockERC20.deploy("Tether USD", "USDT", 1000000);
    await usdt.deployed();
    console.log("Mock USDT deployed to:", usdt.address);
    
    // Authorize tokens
    await trustInvoice.authorizeToken(usdc.address, true);
    await trustInvoice.authorizeToken(usdt.address, true);
    console.log("Tokens authorized");
  }

  // Verify contracts on etherscan (if not local)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await factory.deployTransaction.wait(6);
    await trustInvoice.deployTransaction.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: factory.address,
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: trustInvoice.address,
        constructorArguments: [deployer.address],
      });
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    factory: factory.address,
    trustInvoice: trustInvoice.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });