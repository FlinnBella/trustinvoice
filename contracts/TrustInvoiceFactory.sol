// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TrustInvoice.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrustInvoice Factory
 * @dev Factory contract for deploying TrustInvoice contracts
 */
contract TrustInvoiceFactory is Ownable {
    address[] public deployedContracts;
    mapping(address => address[]) public userContracts;
    
    event ContractDeployed(address indexed contractAddress, address indexed deployer);
    
    function deployTrustInvoice(address payable _feeRecipient) external returns (address) {
        TrustInvoice newContract = new TrustInvoice(_feeRecipient);
        address contractAddress = address(newContract);
        
        deployedContracts.push(contractAddress);
        userContracts[msg.sender].push(contractAddress);
        
        // Transfer ownership to deployer
        newContract.transferOwnership(msg.sender);
        
        emit ContractDeployed(contractAddress, msg.sender);
        
        return contractAddress;
    }
    
    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }
    
    function getUserContracts(address _user) external view returns (address[] memory) {
        return userContracts[_user];
    }
    
    function getContractCount() external view returns (uint256) {
        return deployedContracts.length;
    }
}