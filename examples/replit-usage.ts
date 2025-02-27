// Example of using camt-parser in a Replit project
import { parseCamt053, BankStatementDocument } from 'camt-parser';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Parse a CAMT.053 XML file and extract key information
 * @param filePath Path to the CAMT XML file
 */
async function processCamtFile(filePath: string) {
  try {
    // Read the XML file
    console.log(`Reading file: ${filePath}`);
    const xmlContent = readFileSync(filePath, 'utf-8');
    
    // Parse the XML content
    console.log('Parsing CAMT XML...');
    const result: BankStatementDocument = await parseCamt053(xmlContent);
    
    // Process each statement
    result.statements.forEach((statement, index) => {
      console.log(`\n=== Statement #${index + 1} ===`);
      
      // Basic statement info
      console.log(`Statement ID: ${statement.statementId}`);
      console.log(`Statement Date: ${statement.toDateTime}`);
      
      // Account details
      console.log(`\nAccount: ${statement.account.iban} (${statement.account.currency})`);
      console.log(`Account Owner: ${statement.account.owner.name}`);
      
      // Find opening and closing balances
      const openingBalance = statement.balances.find(bal => bal.type === 'OPBD');
      const closingBalance = statement.balances.find(bal => bal.type === 'CLBD');
      
      console.log('\nBalances:');
      if (openingBalance) {
        console.log(`Opening: ${openingBalance.amount.value} ${openingBalance.amount.currency}`);
      }
      
      if (closingBalance) {
        console.log(`Closing: ${closingBalance.amount.value} ${closingBalance.amount.currency}`);
      }
      
      // Process transactions
      console.log(`\nTransactions (${statement.transactions.length}):`);
      statement.transactions.forEach((tx, txIndex) => {
        console.log(`\n${txIndex + 1}. Amount: ${tx.amount.value} ${tx.amount.currency} (${tx.creditDebitIndicator})`);
        console.log(`   Date: ${tx.bookingDate}`);
        console.log(`   Status: ${tx.status}`);
        
        // Process transaction details
        if (tx.details.length > 0) {
          const detail = tx.details[0];
          console.log(`   Reference: ${detail.references.endToEndId}`);
          
          if (detail.relatedParties?.creditor) {
            console.log(`   Creditor: ${detail.relatedParties.creditor.name}`);
          }
          
          if (detail.remittanceInformation?.structured.additionalRemittanceInformation.length > 0) {
            console.log(`   Info: ${detail.remittanceInformation.structured.additionalRemittanceInformation.join(', ')}`);
          }
        }
      });
    });
    
    // Save a JSON representation for reference
    const jsonOutputPath = `${filePath}.json`;
    writeFileSync(jsonOutputPath, JSON.stringify(result, null, 2));
    console.log(`\nSaved detailed JSON output to: ${jsonOutputPath}`);
    
    return result;
  } catch (error) {
    console.error('Error processing CAMT file:', error);
    throw error;
  }
}

// Example usage in a Replit project
// Replace 'path/to/your/file.xml' with the actual path to your CAMT XML file
processCamtFile('path/to/your/file.xml')
  .then(() => console.log('Processing complete!'))
  .catch(error => console.error('Failed to process file:', error));

/**
 * Helper function for Replit agents
 * @param filePath Path to the CAMT XML file
 * @returns Structured data from the bank statement
 */
export async function agentProcessBankStatement(filePath: string) {
  try {
    const xmlContent = readFileSync(filePath, 'utf-8');
    const result = await parseCamt053(xmlContent);
    
    // Extract key information from the first statement
    const statement = result.statements[0];
    const openingBalance = statement.balances.find(b => b.type === 'OPBD');
    const closingBalance = statement.balances.find(b => b.type === 'CLBD');
    
    return {
      success: true,
      data: {
        statementId: statement.statementId,
        statementDate: statement.toDateTime,
        account: {
          iban: statement.account.iban,
          currency: statement.account.currency,
          owner: statement.account.owner.name
        },
        balances: {
          opening: openingBalance ? {
            amount: openingBalance.amount.value,
            currency: openingBalance.amount.currency,
            type: openingBalance.creditDebitIndicator
          } : null,
          closing: closingBalance ? {
            amount: closingBalance.amount.value,
            currency: closingBalance.amount.currency,
            type: closingBalance.creditDebitIndicator
          } : null
        },
        transactionCount: statement.transactions.length,
        transactions: statement.transactions.map(tx => ({
          reference: tx.reference || 'N/A',
          amount: tx.amount.value,
          currency: tx.amount.currency,
          type: tx.creditDebitIndicator,
          date: tx.bookingDate,
          details: tx.details.map(detail => ({
            endToEndId: detail.references.endToEndId,
            creditor: detail.relatedParties?.creditor?.name || 'N/A',
            creditorIban: detail.relatedParties?.creditorAccount?.iban || 'N/A',
            reference: detail.remittanceInformation?.structured.creditorReferenceInformation.reference || 'N/A',
            additionalInfo: detail.remittanceInformation?.structured.additionalRemittanceInformation.join(', ') || ''
          }))
        }))
      },
      message: `Successfully parsed bank statement ${statement.statementId} dated ${statement.toDateTime}`
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: `Failed to parse CAMT file: ${error.message}`
    };
  }
} 