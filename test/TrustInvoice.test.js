const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrustInvoice", function () {
  let TrustInvoice, trustInvoice, MockERC20, mockToken;
  let owner, recipient, payer, feeRecipient;
  
  beforeEach(async function () {
    [owner, recipient, payer, feeRecipient] = await ethers.getSigners();
    
    TrustInvoice = await ethers.getContractFactory("TrustInvoice");
    trustInvoice = await TrustInvoice.deploy(feeRecipient.address);
    
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Test Token", "TEST", 1000000);
    
    await trustInvoice.authorizeToken(mockToken.address, true);
    await mockToken.mint(payer.address, ethers.utils.parseEther("1000"));
  });

  describe("Invoice Creation", function () {
    it("Should create an invoice successfully", async function () {
      const amount = ethers.utils.parseEther("100");
      const dueDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      
      const tx = await trustInvoice.createInvoice(
        "INV-001",
        recipient.address,
        amount,
        dueDate,
        ethers.constants.AddressZero,
        false,
        "Test invoice"
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "InvoiceCreated");
      
      expect(event).to.not.be.undefined;
      expect(event.args.invoiceId).to.equal("INV-001");
      expect(event.args.recipient).to.equal(recipient.address);
      expect(event.args.amount).to.equal(amount);
    });

    it("Should fail with invalid parameters", async function () {
      const amount = ethers.utils.parseEther("100");
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      
      await expect(
        trustInvoice.createInvoice(
          "INV-002",
          recipient.address,
          amount,
          pastDate,
          ethers.constants.AddressZero,
          false,
          "Test invoice"
        )
      ).to.be.revertedWith("Due date must be in the future");
    });
  });

  describe("Invoice Payment", function () {
    let invoiceHash;
    const amount = ethers.utils.parseEther("100");
    
    beforeEach(async function () {
      const dueDate = Math.floor(Date.now() / 1000) + 86400;
      
      const tx = await trustInvoice.createInvoice(
        "INV-003",
        recipient.address,
        amount,
        dueDate,
        ethers.constants.AddressZero,
        false,
        "Test invoice"
      );
      
      const receipt = await tx.wait();
      invoiceHash = receipt.events.find(e => e.event === "InvoiceCreated").args[0];
    });

    it("Should pay invoice with ETH", async function () {
      const initialBalance = await recipient.getBalance();
      
      await trustInvoice.connect(payer).payInvoice(invoiceHash, { value: amount });
      
      const invoice = await trustInvoice.getInvoice(invoiceHash);
      expect(invoice.isPaid).to.be.true;
      expect(invoice.payer).to.equal(payer.address);
      
      const finalBalance = await recipient.getBalance();
      const fee = amount.mul(250).div(10000); // 2.5% fee
      const expectedIncrease = amount.sub(fee);
      
      expect(finalBalance.sub(initialBalance)).to.equal(expectedIncrease);
    });

    it("Should pay invoice with ERC20 token", async function () {
      const dueDate = Math.floor(Date.now() / 1000) + 86400;
      
      const tx = await trustInvoice.createInvoice(
        "INV-004",
        recipient.address,
        amount,
        dueDate,
        mockToken.address,
        false,
        "Token invoice"
      );
      
      const receipt = await tx.wait();
      const tokenInvoiceHash = receipt.events.find(e => e.event === "InvoiceCreated").args[0];
      
      await mockToken.connect(payer).approve(trustInvoice.address, amount);
      await trustInvoice.connect(payer).payInvoice(tokenInvoiceHash);
      
      const invoice = await trustInvoice.getInvoice(tokenInvoiceHash);
      expect(invoice.isPaid).to.be.true;
    });

    it("Should handle escrow payments", async function () {
      const dueDate = Math.floor(Date.now() / 1000) + 86400;
      
      const tx = await trustInvoice.createInvoice(
        "INV-005",
        recipient.address,
        amount,
        dueDate,
        ethers.constants.AddressZero,
        true, // escrow
        "Escrow invoice"
      );
      
      const receipt = await tx.wait();
      const escrowInvoiceHash = receipt.events.find(e => e.event === "InvoiceCreated").args[0];
      
      const initialBalance = await recipient.getBalance();
      
      // Pay invoice (funds should be held in escrow)
      await trustInvoice.connect(payer).payInvoice(escrowInvoiceHash, { value: amount });
      
      const balanceAfterPayment = await recipient.getBalance();
      expect(balanceAfterPayment).to.equal(initialBalance); // No change yet
      
      // Release escrow
      await trustInvoice.connect(recipient).releaseEscrow(escrowInvoiceHash);
      
      const finalBalance = await recipient.getBalance();
      const fee = amount.mul(250).div(10000);
      const expectedIncrease = amount.sub(fee);
      
      expect(finalBalance.sub(initialBalance)).to.be.closeTo(expectedIncrease, ethers.utils.parseEther("0.01"));
    });
  });

  describe("Refunds", function () {
    it("Should refund escrowed payment", async function () {
      const amount = ethers.utils.parseEther("100");
      const dueDate = Math.floor(Date.now() / 1000) + 86400;
      
      const tx = await trustInvoice.createInvoice(
        "INV-006",
        recipient.address,
        amount,
        dueDate,
        ethers.constants.AddressZero,
        true,
        "Refund test"
      );
      
      const receipt = await tx.wait();
      const invoiceHash = receipt.events.find(e => e.event === "InvoiceCreated").args[0];
      
      const initialPayerBalance = await payer.getBalance();
      
      // Pay invoice
      const payTx = await trustInvoice.connect(payer).payInvoice(invoiceHash, { value: amount });
      const payReceipt = await payTx.wait();
      const gasUsed = payReceipt.gasUsed.mul(payReceipt.effectiveGasPrice);
      
      // Refund
      await trustInvoice.connect(recipient).refundInvoice(invoiceHash);
      
      const finalPayerBalance = await payer.getBalance();
      const expectedBalance = initialPayerBalance.sub(gasUsed);
      
      expect(finalPayerBalance).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.01"));
    });
  });

  describe("Admin Functions", function () {
    it("Should update platform fee", async function () {
      await trustInvoice.updatePlatformFee(500); // 5%
      expect(await trustInvoice.platformFee()).to.equal(500);
    });

    it("Should authorize/deauthorize tokens", async function () {
      const newToken = await MockERC20.deploy("New Token", "NEW", 1000000);
      
      await trustInvoice.authorizeToken(newToken.address, true);
      expect(await trustInvoice.authorizedTokens(newToken.address)).to.be.true;
      
      await trustInvoice.authorizeToken(newToken.address, false);
      expect(await trustInvoice.authorizedTokens(newToken.address)).to.be.false;
    });

    it("Should pause and unpause contract", async function () {
      await trustInvoice.pause();
      
      const amount = ethers.utils.parseEther("100");
      const dueDate = Math.floor(Date.now() / 1000) + 86400;
      
      await expect(
        trustInvoice.createInvoice(
          "INV-007",
          recipient.address,
          amount,
          dueDate,
          ethers.constants.AddressZero,
          false,
          "Paused test"
        )
      ).to.be.revertedWith("Pausable: paused");
      
      await trustInvoice.unpause();
      
      // Should work after unpause
      await expect(
        trustInvoice.createInvoice(
          "INV-008",
          recipient.address,
          amount,
          dueDate,
          ethers.constants.AddressZero,
          false,
          "Unpaused test"
        )
      ).to.not.be.reverted;
    });
  });
});