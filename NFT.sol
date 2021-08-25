// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    
    uint public constant PRICE = 0.1 ether;
    uint public constant PURCHASE_LIMIT = 3;
    uint public constant MAX_TOKEN = 20;
    
    bool public isActive = false;

    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}
    
    function mint(uint numberOfTokens) external payable {
        require(isActive, 'Contract is not active');
        require(totalSupply() < MAX_TOKEN, 'All tokens have been minted');
        require(numberOfTokens <= PURCHASE_LIMIT, 'Would exceed PURCHASE_LIMIT');
        require(PRICE * numberOfTokens <= msg.value, 'ETH amount is not sufficient');
    
        for (uint256 i = 0; i < numberOfTokens; i++) {
            if (totalSupply() < MAX_TOKEN) {
                uint256 tokenId = totalSupply() + 1;
                _safeMint(msg.sender, tokenId);
            }
        }
    }
    
    function setIsActive(bool _isActive) external onlyOwner {
        isActive = _isActive;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}