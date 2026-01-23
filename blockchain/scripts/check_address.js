const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
