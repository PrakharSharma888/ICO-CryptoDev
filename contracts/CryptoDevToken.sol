// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable{

    ICryptoDevs cryptoDevsNFT;
    mapping (uint256 => bool) public tokenIdsClaimed;
    uint256 public constant tokenPrice = 0.001 ether; 
    uint256 public constant tokensPerNFT = 1 * 10**18; // to convert it into a big number and _mint accepts only bignumber
    uint256 public constant maxTotalSupply  = 10000 * 10**18;

    constructor(address cryptoDevContract) ERC20("Crypto Devs Token","CD"){
        cryptoDevsNFT = ICryptoDevs(cryptoDevContract);
    }

    function claim() public {
        address sender = msg.sender;
        uint256 balance = cryptoDevsNFT.balanceOf(sender);
        require(balance > 0,"You dont have any NFTs minted !");
        uint256 amount = 0;

        for(uint256 i=0; i<balance; i++){
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId]){
                amount ++;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0,"You have minted all your tokens");
        _mint(sender, amount * tokensPerNFT);
    }

    function mint(uint256 amount) payable public{ // like public mint
        uint requiredAmount = amount * tokenPrice;
        require(msg.value >= requiredAmount, "You paid less then the price!");
        uint requiredAmountBigNumber = requiredAmount * 10**18;
        require(totalSupply() + requiredAmountBigNumber > maxTotalSupply , "Tokens are all exausted guys!");

        _mint(msg.sender, requiredAmountBigNumber);
    }

    receive() external payable{}
    fallback() external payable{}
}