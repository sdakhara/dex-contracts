const { Wallet } = require("ethers");
const { JsonRpcProvider } = require("ethers");
const { ethers } = require("hardhat");
const DexBuild = require("../artifacts/contracts/Dex.sol/Dex.json");
const TokenBuild = require("../artifacts/contracts/Token.sol/Token.json");
const { EtherscanProvider } = require("ethers");
async function main() {
	const provider = new JsonRpcProvider("http://127.0.0.1:8545");
	const wallet = new Wallet(
		"0x42c82b45f38e5f31b169dbefca34b6d59d3edf9e2f3d49a11b08c843318e0fa9",
		provider
	);

	const contractFactory = new ethers.ContractFactory(
		DexBuild.abi,
		DexBuild.bytecode,
		wallet
	);
	console.log("Deploying, please wait...");
	const contract = await contractFactory.deploy();
	const deploymentReceipt = await contract.deploymentTransaction().wait();
	console.log(`Dex Contract deployed to ${await contract.getAddress()}`);

	const tokenFactory = new ethers.ContractFactory(
		TokenBuild.abi,
		TokenBuild.bytecode,
		owner
	);

	const token1Contract = await tokenFactory.deploy("token1", "ONE");
	await token1Contract.deploymentTransaction().wait(1);
	console.log("Token1 Contract Address: ", await token1Contract.getAddress());

	const token2Contract = await tokenFactory.deploy("token2", "TWO");
	await token2Contract.deploymentTransaction().wait(1);
	console.log("Token2 Contract Address: ", await token2Contract.getAddress());
}

main();
