import jsPDF from 'jspdf';
import { InvoiceData } from '../types';

export interface PDFGenerationOptions {
  method: 'browser' | 'api';
  apiKey?: string;
  template?: 'modern' | 'classic' | 'minimal';
}

export class PDFGenerator {
  private options: PDFGenerationOptions;

  constructor(options: PDFGenerationOptions = { method: 'api', apiKey: import.meta.env.VITE_PDF_API_KEY }) {
    this.options = options;
  }

  async generateInvoicePDF(invoiceData: InvoiceData): Promise<Blob> {
    if (this.options.method === 'api') {
      return this.generateViaPDFAPI(invoiceData);
    } else {
      return this.generateInBrowser(invoiceData);
    }
  }

  private async generateInBrowser(invoiceData: InvoiceData): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Colors
    const primaryColor = '#1e40af';
    const secondaryColor = '#64748b';
    const accentColor = '#3b82f6';
    
    // Header
    pdf.setFillColor(30, 64, 175);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Company Logo/Icon
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.text('🛡️', 20, 25);
    
    // Company Name
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TrustInvoice', 35, 25);
    
    // Invoice Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('INVOICE', pageWidth - 60, 25);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Company Information
    let yPos = 60;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('From:', 20, yPos);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    yPos += 8;
    pdf.text(invoiceData.companyName || 'Company Name', 20, yPos);
    
    if (invoiceData.companyAddress) {
      const addressLines = invoiceData.companyAddress.split('\n');
      addressLines.forEach(line => {
        yPos += 6;
        pdf.text(line, 20, yPos);
      });
    }
    
    // Invoice Details (Right side)
    yPos = 60;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice Details:', pageWidth - 100, yPos);
    
    pdf.setFont('helvetica', 'normal');
    yPos += 8;
    pdf.text(`Invoice #: ${invoiceData.invoiceNumber}`, pageWidth - 100, yPos);
    yPos += 6;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 100, yPos);
    yPos += 6;
    pdf.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, pageWidth - 100, yPos);
    
    // Bill To
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill To:', 20, yPos);
    
    pdf.setFont('helvetica', 'normal');
    yPos += 8;
    pdf.text(invoiceData.recipientEmail, 20, yPos);
    
    // Description
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description:', 20, yPos);
    
    pdf.setFont('helvetica', 'normal');
    yPos += 8;
    const description = invoiceData.description || 'Professional services';
    const descriptionLines = pdf.splitTextToSize(description, pageWidth - 40);
    pdf.text(descriptionLines, 20, yPos);
    yPos += descriptionLines.length * 6;
    
    // Items Table
    yPos += 20;
    const tableStartY = yPos;
    
    // Table Header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description', 25, yPos + 5);
    pdf.text('Qty', pageWidth - 120, yPos + 5);
    pdf.text('Rate', pageWidth - 80, yPos + 5);
    pdf.text('Amount', pageWidth - 40, yPos + 5);
    
    // Table Rows
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    yPos += 15;
    
    let total = 0;
    (invoiceData.items || []).forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(20, yPos - 3, pageWidth - 40, 12, 'F');
      }
      
      pdf.text(item.description, 25, yPos + 5);
      pdf.text(item.quantity.toString(), pageWidth - 120, yPos + 5);
      pdf.text(`$${item.rate.toFixed(2)}`, pageWidth - 80, yPos + 5);
      pdf.text(`$${item.amount.toFixed(2)}`, pageWidth - 40, yPos + 5);
      
      total += item.amount;
      yPos += 12;
    });
    
    // Total
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Total:', pageWidth - 80, yPos);
    pdf.text(`$${total.toFixed(2)}`, pageWidth - 40, yPos);
    
    // Blockchain Information (if available)
    if (invoiceData.smart_contract_address) {
      yPos += 30;
      pdf.setFillColor(34, 197, 94);
      pdf.rect(20, yPos - 5, pageWidth - 40, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🔗 Blockchain Security', 25, yPos + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('This invoice is secured by smart contract:', 25, yPos + 12);
      pdf.text(`Contract: ${invoiceData.smart_contract_address}`, 25, yPos + 18);
    }
    
    // Footer
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(10);
    pdf.text('Generated by TrustInvoice - Secure Blockchain Invoicing', 20, pageHeight - 20);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, pageHeight - 10);
    
    // Convert to blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  }

  private async generateViaPDFAPI(invoiceData: InvoiceData): Promise<Blob> {
    if (!this.options.apiKey) {
      throw new Error('PDF API key required for API-based generation');
    }

    // Example using a PDF generation API (like PDFShift, HTML/CSS to PDF, etc.)
    const htmlContent = this.generateHTMLTemplate(invoiceData);
    
    try {
      const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.options.apiKey}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: htmlContent,
          landscape: false,
          format: 'A4',
          margin: '20px',
          print_background: true,
          sandbox: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`PDF API error: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF API generation failed, falling back to browser generation:', error);
      return this.generateInBrowser(invoiceData);
    }
  }

  private generateHTMLTemplate(invoiceData: InvoiceData): string {
    const total = (invoiceData.items || []).reduce((sum, item) => sum + item.amount, 0);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: white;
          }
          .container { max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo { font-size: 24px; font-weight: bold; }
          .invoice-title { font-size: 28px; font-weight: 300; }
          .content { padding: 30px; background: #f8fafc; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-section h3 { color: #1e40af; margin-bottom: 10px; font-size: 16px; }
          .info-section p { margin-bottom: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th { 
            background: #1e40af; 
            color: white; 
            padding: 12px; 
            text-align: left; 
            font-weight: 600;
          }
          .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .table tr:nth-child(even) { background: #f1f5f9; }
          .total { 
            text-align: right; 
            font-size: 24px; 
            font-weight: bold; 
            color: #1e40af; 
            margin-top: 20px;
          }
          .blockchain-info { 
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); 
            border: 2px solid #bbf7d0; 
            border-radius: 12px; 
            padding: 20px; 
            margin-top: 30px;
          }
          .blockchain-info h3 { color: #059669; margin-bottom: 10px; }
          .footer { 
            text-align: center; 
            color: #64748b; 
            font-size: 12px; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ TrustInvoice</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="content">
            <div class="info-grid">
              <div class="info-section">
                <h3>From:</h3>
                <p><strong>${invoiceData.companyName || 'Company Name'}</strong></p>
                <p>${(invoiceData.companyAddress || '').replace(/\n/g, '<br>')}</p>
              </div>
              
              <div class="info-section">
                <h3>Invoice Details:</h3>
                <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Bill To:</h3>
              <p>${invoiceData.recipientEmail}</p>
            </div>
            
            <div class="info-section">
              <h3>Description:</h3>
              <p>${invoiceData.description || 'Professional services'}</p>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(invoiceData.items || []).map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.rate.toFixed(2)}</td>
                    <td>$${item.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              Total: $${total.toFixed(2)}
            </div>
            
            ${invoiceData.smart_contract_address ? `
              <div class="blockchain-info">
                <h3>🔗 Blockchain Security</h3>
                <p>This invoice is secured by a smart contract on the blockchain:</p>
                <p><strong>Contract Address:</strong> ${invoiceData.smart_contract_address}</p>
                ${invoiceData.blockchain_tx_hash ? `<p><strong>Transaction Hash:</strong> ${invoiceData.blockchain_tx_hash}</p>` : ''}
                <p style="margin-top: 10px; font-style: italic;">
                  This ensures the invoice is tamper-proof and payment terms are automatically enforced.
                </p>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Generated by TrustInvoice - Secure Blockchain Invoicing</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async downloadPDF(invoiceData: InvoiceData, filename?: string): Promise<void> {
    const pdfBlob = await this.generateInvoicePDF(invoiceData);
    const url = URL.createObjectURL(pdfBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `invoice-${invoiceData.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  async getPDFDataURL(invoiceData: InvoiceData): Promise<string> {
    const pdfBlob = await this.generateInvoicePDF(invoiceData);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
  }
}

export const pdfGenerator = new PDFGenerator({
  method: 'browser', // Can be changed to 'api' with proper API key
  apiKey: import.meta.env.VITE_PDF_API_KEY
});