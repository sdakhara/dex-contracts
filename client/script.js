const connectButton = document.getElementById("connectButton");
const accountAddress = document.getElementById("accountAddress");

const depositTokenSelect = document.getElementById("depositTokenSelect");
const depositButton = document.getElementById("depositButton");
const withdrawButton = document.getElementById("withdrawButton");
const tokenDetailsButton = document.getElementById("tokenDetailsButton");
const amountInput = document.getElementById("amountInput");

const baseTokenInput = document.getElementById("baseTokenInput");
const quoteTokenInput = document.getElementById("quoteTokenInput");

const baseTokenName = document.getElementById("baseTokenName");
const baseTokenSymbol = document.getElementById("baseTokenSymbol");
const baseTokenBalance = document.getElementById("baseTokenBalance");
const baseTokenDexBalance = document.getElementById("baseTokenDexBalance");

const quoteTokenName = document.getElementById("quoteTokenName");
const quoteTokenSymbol = document.getElementById("quoteTokenSymbol");
const quoteTokenBalance = document.getElementById("quoteTokenBalance");
const quoteTokenDexBalance = document.getElementById("quoteTokenDexBalance");

const orderAmountInput = document.getElementById("orderAmountInput");
const orderPriceInput = document.getElementById("orderPriceInput");
const createOrderButton = document.getElementById("createOrderButton");

let web3;
let dexContract;
let userAccount;
let baseTokenContract;
let quoteTokenContract;

connectButton.addEventListener("click", async () => {
	if (typeof window.ethereum !== "undefined") {
		const accounts = await window.ethereum.request({
			method: "eth_requestAccounts",
		});
		accountAddress.textContent = `Connected to account: ${accounts[0]}`;
		userAccount = accounts[0];
		web3 = new Web3(window.ethereum);
		dexContract = new web3.eth.Contract(dexAbi, dexAddress);
	} else {
		alert("Please install MetaMask!");
	}
});

const getTokenDetails = async () => {
	const baseTokenAddress = baseTokenInput.value;
	const quoteTokenAddress = quoteTokenInput.value;
	baseTokenContract = new web3.eth.Contract(tokenAbi, baseTokenAddress);
	quoteTokenContract = new web3.eth.Contract(tokenAbi, quoteTokenAddress);

	baseTokenName.textContent = await baseTokenContract.methods.name().call();
	baseTokenSymbol.textContent = await baseTokenContract.methods
		.symbol()
		.call();
	baseTokenBalance.textContent = web3.utils.fromWei(
		await baseTokenContract.methods.balanceOf(userAccount).call(),
		"ether"
	);
	baseTokenDexBalance.textContent = web3.utils.fromWei(
		await dexContract.methods
			.userBalances(userAccount, baseTokenAddress)
			.call(),
		"ether"
	);

	quoteTokenName.textContent = await quoteTokenContract.methods.name().call();
	quoteTokenSymbol.textContent = await quoteTokenContract.methods
		.symbol()
		.call();
	quoteTokenBalance.textContent = web3.utils.fromWei(
		await quoteTokenContract.methods.balanceOf(userAccount).call(),
		"ether"
	);

	quoteTokenDexBalance.textContent = web3.utils.fromWei(
		await dexContract.methods
			.userBalances(userAccount, quoteTokenAddress)
			.call(),
		"ether"
	);

	const buyOrders = await dexContract.methods
		.getOrderBook(baseTokenAddress, quoteTokenAddress)
		.call();
	console.log(buyOrders);
	const sellOrders = await dexContract.methods
		.getOrderBook(quoteTokenAddress, baseTokenAddress)
		.call();
	console.log(sellOrders);
};

tokenDetailsButton.addEventListener("click", getTokenDetails);

depositButton.addEventListener("click", async () => {
	const amount = web3.utils.toWei(
		parseFloat(amountInput.value).toString(),
		"ether"
	);

	console.log(amount);
	console.log(depositTokenSelect.value);
	console.log(baseTokenContract.options.address);
	if (depositTokenSelect.value == "base") {
		baseTokenContract.methods
			.approve(dexContract.options.address, amount)
			.send({ from: userAccount })
			.on("receipt", (receipt) => {
				dexContract.methods
					.deposit(baseTokenContract.options.address, amount)
					.send({ from: userAccount })
					.on("receipt", () => getTokenDetails());
			});
	} else {
		quoteTokenContract.methods
			.approve(dexContract.options.address, amount)
			.send({ from: userAccount })
			.on("receipt", (receipt) => {
				dexContract.methods
					.deposit(quoteTokenContract.options.address, amount)
					.send({ from: userAccount })
					.on("receipt", () => getTokenDetails());
			});
	}
});

withdrawButton.addEventListener("click", async () => {
	const amount = web3.utils.toWei(
		parseFloat(amountInput.value).toString(),
		"ether"
	);

	console.log(amount);
	console.log(depositTokenSelect.value);
	console.log(baseTokenContract.options.address);
	if (depositTokenSelect.value == "base") {
		dexContract.methods
			.withdraw(baseTokenContract.options.address, amount)
			.send({ from: userAccount })
			.on("receipt", () => getTokenDetails());
	} else {
		dexContract.methods
			.withdraw(quoteTokenContract.options.address, amount)
			.send({ from: userAccount })
			.on("receipt", () => getTokenDetails());
	}
});

createOrderButton.addEventListener("click", async () => {
	const amount = web3.utils.toWei(
		parseFloat(orderAmountInput.value).toString(),
		"ether"
	);
	const price = web3.utils.toWei(
		parseFloat(orderPriceInput.value).toString(),
		"ether"
	);

	dexContract.methods
		.createOrder(
			baseTokenContract.options.address,
			quoteTokenContract.options.address,
			amount,
			price
		)
		.send({ from: userAccount })
		.on("receipt", () => getTokenDetails());
});
