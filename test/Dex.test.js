const { expect } = require("chai");
const { ethers } = require("ethers");
const Dex = require("../artifacts/contracts/Dex.sol/Dex.json");
const Token = require("../artifacts/contracts/Token.sol/Token.json");

let provider;
let dexContract;
let token1Contract;
let token2Contract;
let owner;
let anotherAccount;

beforeEach(async () => {
	provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Replace with your provider
	owner = new ethers.Wallet(
		"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
		provider
	);

	const dexFactory = new ethers.ContractFactory(Dex.abi, Dex.bytecode, owner);
	dexContract = await dexFactory.deploy();
	await dexContract.deploymentTransaction().wait(1);
	console.log(await dexContract.getAddress());
	const tokenFactory = new ethers.ContractFactory(
		Token.abi,
		Token.bytecode,
		owner
	);

	token1Contract = await tokenFactory.deploy("token1", "ONE");
	await token1Contract.deploymentTransaction().wait(1);
	console.log(await token1Contract.getAddress());
	token2Contract = await tokenFactory.deploy("token2", "TWO");
	await token2Contract.deploymentTransaction().wait(1);
	console.log(await token2Contract.getAddress());
	console.log(owner.address);
});

describe("Dex contract", function () {
	describe("Deposit", function () {
		it("should deposit tokens for a user", async () => {
			const amount = 1000;

			await (
				await token1Contract.approve(
					await dexContract.getAddress(),
					amount
				)
			).wait();

			console.log("amount approved");
			await dexContract.deposit(
				await token1Contract.getAddress(),
				amount,
				{
					from: owner,
					nonce: await owner.getNonce(),
				}
			);
			console.log("token deposited");
			const balance = await dexContract.userBalances(
				owner.address,
				await token1Contract.getAddress()
			);
			expect(balance).to.equal(amount);
		});

		it("should revert if user doesn't have enough allowance", async () => {
			const amount = 1000;

			await expect(
				dexContract.deposit(await token1Contract.getAddress(), amount, {
					from: owner,
					nonce: await owner.getNonce(),
				})
			).to.be.revertedWith("DEX: Insufficient Allowance");
		});
	});

	it("createOrder", async () => {
		const amount = 1000;

		await (
			await token1Contract.approve(await dexContract.getAddress(), amount)
		).wait();

		console.log("amount approved");
		await dexContract.deposit(await token1Contract.getAddress(), amount, {
			from: owner,
			nonce: await owner.getNonce(),
		});

		await (
			await dexContract.createOrder(
				await token1Contract.getAddress(),
				await token2Contract.getAddress(),
				1000n,
				5n
			)
		).wait();

		const order = await dexContract.orderBook(
			await token1Contract.getAddress(),
			await token2Contract.getAddress(),
			0
		);
		console.log(order);

		expect(order[0]).to.equal(owner.address);
		expect(order[3]).to.equal(1000n);
		expect(order[4]).to.equal(5n);
	});

	it("withdraw", async () => {
		const amount = 1000;

		const initialBalance = await token1Contract.balanceOf(owner.address);

		await (
			await token1Contract.approve(await dexContract.getAddress(), amount)
		).wait();

		await dexContract.deposit(await token1Contract.getAddress(), amount, {
			from: owner,
			nonce: await owner.getNonce(),
		});

		await dexContract.withdraw(await token1Contract.getAddress(), amount, {
			from: owner,
		});
		const balanceAfterWithdraw = await token1Contract.balanceOf(
			owner.address
		);
		expect(balanceAfterWithdraw).to.equal(initialBalance);
	});
});
