// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TrustInvoice Smart Contract
 * @dev Handles invoice payments with escrow functionality, multi-token support, and automated execution
 */
contract TrustInvoice is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    struct Invoice {
        address payable recipient;
        address payer;
        uint256 amount;
        uint256 dueDate;
        uint256 createdAt;
        address tokenAddress; // address(0) for ETH
        bool isPaid;
        bool isRefunded;
        bool isEscrow;
        string invoiceId;
        string description;
    }

    mapping(bytes32 => Invoice) public invoices;
    mapping(address => uint256) public userInvoiceCount;
    mapping(address => bool) public authorizedTokens;
    
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant MAX_FEE = 1000; // 10% max fee
    address payable public feeRecipient;
    
    event InvoiceCreated(
        bytes32 indexed invoiceHash,
        string indexed invoiceId,
        address indexed recipient,
        uint256 amount,
        uint256 dueDate,
        address tokenAddress
    );
    
    event InvoicePaid(
        bytes32 indexed invoiceHash,
        string indexed invoiceId,
        address indexed payer,
        uint256 amount,
        uint256 fee
    );
    
    event InvoiceRefunded(
        bytes32 indexed invoiceHash,
        string indexed invoiceId,
        address indexed recipient,
        uint256 amount
    );
    
    event TokenAuthorized(address indexed token, bool authorized);
    event FeeUpdated(uint256 newFee);

    modifier validInvoice(bytes32 _invoiceHash) {
        require(invoices[_invoiceHash].recipient != address(0), "Invoice does not exist");
        _;
    }

    modifier onlyRecipient(bytes32 _invoiceHash) {
        require(msg.sender == invoices[_invoiceHash].recipient, "Only recipient can call this");
        _;
    }

    constructor(address payable _feeRecipient) {
        feeRecipient = _feeRecipient;
        
        // Authorize common tokens (addresses will vary by network)
        authorizedTokens[address(0)] = true; // ETH/MATIC
    }

    /**
     * @dev Create a new invoice
     */
    function createInvoice(
        string memory _invoiceId,
        address payable _recipient,
        uint256 _amount,
        uint256 _dueDate,
        address _tokenAddress,
        bool _isEscrow,
        string memory _description
    ) external whenNotPaused returns (bytes32) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be greater than 0");
        require(_dueDate > block.timestamp, "Due date must be in the future");
        require(authorizedTokens[_tokenAddress], "Token not authorized");
        
        bytes32 invoiceHash = keccak256(
            abi.encodePacked(_invoiceId, _recipient, _amount, block.timestamp, msg.sender)
        );
        
        require(invoices[invoiceHash].recipient == address(0), "Invoice already exists");
        
        invoices[invoiceHash] = Invoice({
            recipient: _recipient,
            payer: address(0),
            amount: _amount,
            dueDate: _dueDate,
            createdAt: block.timestamp,
            tokenAddress: _tokenAddress,
            isPaid: false,
            isRefunded: false,
            isEscrow: _isEscrow,
            invoiceId: _invoiceId,
            description: _description
        });
        
        userInvoiceCount[_recipient]++;
        
        emit InvoiceCreated(invoiceHash, _invoiceId, _recipient, _amount, _dueDate, _tokenAddress);
        
        return invoiceHash;
    }

    /**
     * @dev Pay an invoice
     */
    function payInvoice(bytes32 _invoiceHash) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validInvoice(_invoiceHash) 
    {
        Invoice storage invoice = invoices[_invoiceHash];
        require(!invoice.isPaid, "Invoice already paid");
        require(!invoice.isRefunded, "Invoice was refunded");
        
        uint256 fee = (invoice.amount * platformFee) / 10000;
        uint256 netAmount = invoice.amount - fee;
        
        if (invoice.tokenAddress == address(0)) {
            // ETH/MATIC payment
            require(msg.value == invoice.amount, "Incorrect payment amount");
            
            if (!invoice.isEscrow) {
                invoice.recipient.transfer(netAmount);
                feeRecipient.transfer(fee);
            }
        } else {
            // ERC20 token payment
            IERC20 token = IERC20(invoice.tokenAddress);
            token.safeTransferFrom(msg.sender, address(this), invoice.amount);
            
            if (!invoice.isEscrow) {
                token.safeTransfer(invoice.recipient, netAmount);
                token.safeTransfer(feeRecipient, fee);
            }
        }
        
        invoice.isPaid = true;
        invoice.payer = msg.sender;
        
        emit InvoicePaid(_invoiceHash, invoice.invoiceId, msg.sender, invoice.amount, fee);
    }

    /**
     * @dev Release escrowed funds (only recipient)
     */
    function releaseEscrow(bytes32 _invoiceHash) 
        external 
        nonReentrant 
        validInvoice(_invoiceHash) 
        onlyRecipient(_invoiceHash) 
    {
        Invoice storage invoice = invoices[_invoiceHash];
        require(invoice.isPaid, "Invoice not paid");
        require(invoice.isEscrow, "Not an escrow invoice");
        require(!invoice.isRefunded, "Invoice was refunded");
        
        uint256 fee = (invoice.amount * platformFee) / 10000;
        uint256 netAmount = invoice.amount - fee;
        
        if (invoice.tokenAddress == address(0)) {
            invoice.recipient.transfer(netAmount);
            feeRecipient.transfer(fee);
        } else {
            IERC20 token = IERC20(invoice.tokenAddress);
            token.safeTransfer(invoice.recipient, netAmount);
            token.safeTransfer(feeRecipient, fee);
        }
    }

    /**
     * @dev Refund an invoice (only recipient, before payment or from escrow)
     */
    function refundInvoice(bytes32 _invoiceHash) 
        external 
        nonReentrant 
        validInvoice(_invoiceHash) 
        onlyRecipient(_invoiceHash) 
    {
        Invoice storage invoice = invoices[_invoiceHash];
        require(!invoice.isRefunded, "Invoice already refunded");
        
        if (invoice.isPaid) {
            require(invoice.isEscrow, "Can only refund escrowed payments");
            
            if (invoice.tokenAddress == address(0)) {
                payable(invoice.payer).transfer(invoice.amount);
            } else {
                IERC20 token = IERC20(invoice.tokenAddress);
                token.safeTransfer(invoice.payer, invoice.amount);
            }
        }
        
        invoice.isRefunded = true;
        
        emit InvoiceRefunded(_invoiceHash, invoice.invoiceId, invoice.recipient, invoice.amount);
    }

    /**
     * @dev Auto-release escrowed funds after due date + grace period
     */
    function autoReleaseEscrow(bytes32 _invoiceHash) external validInvoice(_invoiceHash) {
        Invoice storage invoice = invoices[_invoiceHash];
        require(invoice.isPaid, "Invoice not paid");
        require(invoice.isEscrow, "Not an escrow invoice");
        require(!invoice.isRefunded, "Invoice was refunded");
        require(block.timestamp > invoice.dueDate + 7 days, "Grace period not expired");
        
        uint256 fee = (invoice.amount * platformFee) / 10000;
        uint256 netAmount = invoice.amount - fee;
        
        if (invoice.tokenAddress == address(0)) {
            invoice.recipient.transfer(netAmount);
            feeRecipient.transfer(fee);
        } else {
            IERC20 token = IERC20(invoice.tokenAddress);
            token.safeTransfer(invoice.recipient, netAmount);
            token.safeTransfer(feeRecipient, fee);
        }
    }

    /**
     * @dev Get invoice details
     */
    function getInvoice(bytes32 _invoiceHash) external view returns (Invoice memory) {
        return invoices[_invoiceHash];
    }

    /**
     * @dev Check if invoice is overdue
     */
    function isOverdue(bytes32 _invoiceHash) external view validInvoice(_invoiceHash) returns (bool) {
        return block.timestamp > invoices[_invoiceHash].dueDate && !invoices[_invoiceHash].isPaid;
    }

    // Admin functions
    function authorizeToken(address _token, bool _authorized) external onlyOwner {
        authorizedTokens[_token] = _authorized;
        emit TokenAuthorized(_token, _authorized);
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee too high");
        platformFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function updateFeeRecipient(address payable _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient");
        feeRecipient = _newRecipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency withdrawal (only owner, when paused)
    function emergencyWithdraw(address _token) external onlyOwner whenPaused {
        if (_token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20 token = IERC20(_token);
            token.safeTransfer(owner(), token.balanceOf(address(this)));
        }
    }
}