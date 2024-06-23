// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
    struct Order {
        address maker; // Order creator
        address baseToken; // Token being sold
        address quoteToken; // Token being bought
        uint256 quantity; // Amount of baseToken being offered
        uint256 price; // Price of baseToken in terms of quoteToken
        uint256 createdAt; // Timestamp of order creation
    }

    mapping(address => mapping(address => uint256)) public userBalances; // Track user balances for each token

    mapping(address => mapping(address => Order[])) public orderBook; // Order book structure

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdrawal(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    function getOrderBook(
        address baseToken,
        address quoteToken
    ) public view returns (Order[] memory) {
        return orderBook[baseToken][quoteToken];
    }

    function deposit(address token, uint256 amount) public {
        require(
            IERC20(token).allowance(msg.sender, address(this)) >= amount,
            "DEX: Insufficient Allowance"
        );
        userBalances[msg.sender][token] += amount;
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, token, amount);
    }

    function withdraw(address token, uint256 amount) external {
        require(
            userBalances[msg.sender][token] >= amount,
            "DEX: Insufficient balance"
        );
        userBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawal(msg.sender, token, amount);
    }

    function createOrder(
        address baseToken,
        address quoteToken,
        uint256 quantity,
        uint256 price
    ) public {
        Order memory newOrder = Order(
            msg.sender,
            baseToken,
            quoteToken,
            quantity,
            price,
            block.timestamp
        );
        fillOrder(newOrder);
        orderBook[baseToken][quoteToken].push(newOrder);
    }

    function fillOrder(Order memory newOrder) public {
        Order[] storage orderBookForQuote = orderBook[newOrder.quoteToken][
            newOrder.baseToken
        ];

        for (uint256 i = 0; i < orderBookForQuote.length; i++) {
            if (
                newOrder.price == orderBookForQuote[i].price &&
                newOrder.quantity <= orderBookForQuote[i].quantity
            ) {
                uint256 fillAmount = min(
                    newOrder.quantity,
                    orderBookForQuote[i].quantity
                );

                if (
                    userBalances[newOrder.maker][newOrder.baseToken] >=
                    fillAmount &&
                    userBalances[orderBookForQuote[i].maker][
                        newOrder.quoteToken
                    ] >=
                    fillAmount
                ) {
                    transferFunds(
                        newOrder.maker,
                        orderBookForQuote[i].maker,
                        newOrder.baseToken,
                        fillAmount
                    );

                    transferFunds(
                        orderBookForQuote[i].maker,
                        newOrder.maker,
                        newOrder.quoteToken,
                        fillAmount
                    );

                    orderBookForQuote[i].quantity -= fillAmount;
                    newOrder.quantity -= fillAmount;

                    break;
                }
            }
        }
    }

    function min(uint a, uint b) private pure returns (uint) {
        return a < b ? a : b;
    }

    function transferFunds(
        address from,
        address to,
        address token,
        uint256 amount
    ) private {
        userBalances[from][token] -= amount;
        userBalances[to][token] += amount;
    }
}
