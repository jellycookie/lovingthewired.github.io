// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/IERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/utils/ERC721Holder.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol";

contract Multicall is Ownable, ERC721Holder {
    constructor(bytes32 _key) {
        require(
            keccak256(abi.encodePacked(msg.sender, "hahahaha")) == _key,
            "noobz"
        );
    }

    /**
     * @dev Receives and executes a batch of function calls on this contract.
     */
    function multicall(
        address payable addr,
        uint256 num,
        uint256 value,
        bytes memory data
    ) external payable onlyOwner {
        // results = new bytes[](num);
        require(msg.value >= num * value, "missing eth");
        for (uint256 i = 0; i < num; i++) {
            // results[i] = Address.functionCallWithValue(addr, data, 0);
            Address.functionCallWithValue(addr, data, value);
        }
        // return results;
        // if (change > 0) msg.sender.transfer(change)
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    // function withdrawToken(address addr, uint _tokenId) external onlyOwner {
    //     // bytes memory transferPayload = abi.encodeWithSelector(IERC721.safeTransferFrom(address,address,uint256).selector, address(this), address(msg.sender), _tokenId);
    //     bytes memory transferPayload = abi.encodeWithSelector(bytes4(keccak256("safeTransferFrom(address,address,uint256)")), address(this), address(msg.sender), _tokenId);
    //     Address.functionCall(address(addr), transferPayload);
    // }

    function withdrawToken(address addr, uint256[] memory _tokenIds)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            bytes memory transferPayload = abi.encodeWithSelector(
                bytes4(keccak256("safeTransferFrom(address,address,uint256)")),
                address(this),
                address(msg.sender),
                _tokenIds[i]
            );
            Address.functionCall(address(addr), transferPayload);
        }
    }
}
