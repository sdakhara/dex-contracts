const { Wallet } = require("ethers");
const { JsonRpcProvider } = require("ethers");
const { ethers } = require("hardhat");
const DexBuild = require("../artifacts/contracts/Dex.sol/Dex.json");
const { EtherscanProvider } = require("ethers");
async function main() {
	const provider = new JsonRpcProvider("http://127.0.0.1:8545");
	const wallet = new Wallet(
		"0x42c82b45f38e5f31b169dbefca34b6d59d3edf9e2f3d49a11b08c843318e0fa9",
		provider
	);
	const wallet1 = new Wallet(
		"0x82fd130d4918b7057d4675c11250737fb11b192faae614e5fb4516f4ab2cce58",
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
	console.log(`Contract deployed to ${await contract.getAddress()}`);

	const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
	const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

	console.log("wallet");
	await (await contract.deposit(usdtAddress, 1000n)).wait();
	console.log(
		"usdt",
		await contract.userBalances(wallet.address, usdtAddress)
	);
	console.log(
		"eth",
		await contract.userBalances(wallet.address, wethAddress)
	);

	await (
		await contract.createOrder(usdtAddress, wethAddress, 1000n, 5n)
	).wait();

	console.log(await contract.orderBook(usdtAddress, wethAddress, 0));

	console.log("wallet1");

	await (await contract.connect(wallet1).deposit(wethAddress, 500n)).wait();
	console.log(
		"usdt",
		await contract.userBalances(wallet1.address, usdtAddress)
	);
	console.log(
		"eth",
		await contract.userBalances(wallet1.address, wethAddress)
	);

	await (
		await contract
			.connect(wallet1)
			.createOrder(wethAddress, usdtAddress, 500n, 5n)
	).wait();

	console.log(await contract.orderBook(usdtAddress, wethAddress, 0));

	console.log("balance after order match");
	console.log(
		"usdt",
		await contract.userBalances(wallet.address, usdtAddress)
	);
	console.log(
		"eth",
		await contract.userBalances(wallet.address, wethAddress)
	);
	console.log(
		"usdt",
		await contract.userBalances(wallet1.address, usdtAddress)
	);
	console.log(
		"eth",
		await contract.userBalances(wallet1.address, wethAddress)
	);

	console.log("second order");

	console.log("wallet1");

	await (await contract.connect(wallet1).deposit(wethAddress, 500n)).wait();
	console.log(
		"usdt",
		await contract.userBalances(wallet1.address, usdtAddress)
	);
	console.log(
		"eth",
		await contract.userBalances(wallet1.address, wethAddress)
	);

	console.log("creating order");
	await (
		await contract
			.connect(wallet1)
			.createOrder(wethAddress, usdtAddress, 500n, 5n, {
				nonce: await wallet1.getNonce(),
			})
	).wait();

	console.log("order created");
	console.log(await contract.orderBook(usdtAddress, wethAddress, 0));

	console.log("balance after second order match");
	console.log(
		"usdt",
		await contract.userBalances(wallet.address, usdtAddress)
	);
	console.log(
		"eth",
		await contract.userBalances(wallet.address, wethAddress)
	);
	console.log(
		"usdt",
		await contract.userBalances(wallet1.address, usdtAddress)
	);
	console.log(
		"eth",
		await contract.userBalances(wallet1.address, wethAddress)
	);
}

main();
