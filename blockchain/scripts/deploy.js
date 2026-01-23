const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "POL");

    const LibChain = await hre.ethers.getContractFactory("LibChain");
    const libChain = await LibChain.deploy();

    await libChain.waitForDeployment();

    console.log(`LibChain deployed to: ${await libChain.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
