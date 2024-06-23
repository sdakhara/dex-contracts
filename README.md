# Dex Contract Task 

this project demonstrates a simple Orderbook-based Exchange contract. 
Here we have 3 user interactable functions
- deposit: to deposit tokens into the contract
- withdraw: to withdraw tokens from the contract
- create order: to create order into the order book. this function will create the order and automatically match the order if the suitable order is available in the Order Book

contract works on the Base Token and the Quote Token which means that the user can input which token he wants to buy against  another token 

## Front End
I have created a simple HTML file for the user interface and used web3.js
The location of user interface is inside the `client` folder

## How to Run?
- Setup the basic hardhat environment
- start the local hardhat node using `npx hardhat node` this will provide you test wallets and keys
- update the wallet private key in tests and the deployment script (if needed, no need to change if they are same)
- run tests using `npx hardhat test`
- run the deployment script and it will provide you `dex contract address` and 2 `token address` 
-- change the dex contract address variable called `dexAddress` inside `client/metadata.js` file
- serve the index.html file using live server and it will open up in your default browser
  

## Tech Stack
- hardhat
- HTML
- Javascript
- Chai
- Hardhat Local Blockchain
