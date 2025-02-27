#!/usr/bin/env node

/**
 * CAMT Parser Demo Script
 * 
 * This script demonstrates how to use the camt-parser package to parse a CAMT.053 XML file
 * and extract useful information from the bank statement.
 * 
 * Usage: node demo.js
 */

const fs = require('fs');
const path = require('path');
const { parseCamt053 } = require('camt-parser');

// Path to the sample CAMT.053 XML file
const sampleFilePath = path.join(__dirname, 'sample-camt053.xml');

// Function to format currency amounts
function formatAmount(amount, currency) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
}

// Main function to process the CAMT file
async function processCamtFile() {
  try {
    console.log('Reading CAMT.053 XML file...');
    const xmlContent = fs.readFileSync(sampleFilePath, 'utf-8');
    
    console.log('Parsing CAMT.053 XML content...');
    const result = await parseCamt053(xmlContent);
    
    // Display document header information
    console.log('\n=== Document Information ===');
    console.log(`Message ID: ${result.header.messageId}`);
    console.log(`Creation Date/Time: ${result.header.creationDateTime}`);
    
    // Process each statement in the document
    result.statements.forEach((statement, index) => {
      console.log(`\n=== Statement #${index + 1} ===`);
      console.log(`Statement ID: ${statement.statementId}`);
      console.log(`Period: ${statement.fromDateTime} to ${statement.toDateTime}`);
      
      // Display account information
      console.log('\n--- Account Information ---');
      console.log(`IBAN: ${statement.account.iban}`);
      console.log(`Currency: ${statement.account.currency}`);
      console.log(`Owner: ${statement.account.owner.name}`);
      console.log(`Address: ${statement.account.owner.address.join(', ')}`);
      
      // Display balance information
      console.log('\n--- Balance Information ---');
      statement.balances.forEach(balance => {
        console.log(`${balance.type} Balance: ${formatAmount(balance.amount.value, balance.amount.currency)} (${balance.creditDebitIndicator})`);
        console.log(`Date: ${balance.date}`);
      });
      
      // Display transaction information
      console.log(`\n--- Transactions (${statement.transactions.length}) ---`);
      statement.transactions.forEach((tx, txIndex) => {
        console.log(`\nTransaction #${txIndex + 1}:`);
        console.log(`Amount: ${formatAmount(tx.amount.value, tx.amount.currency)} (${tx.creditDebitIndicator})`);
        console.log(`Booking Date: ${tx.bookingDate}`);
        console.log(`Status: ${tx.status}`);
        
        // Display transaction details
        if (tx.details.length > 0) {
          const detail = tx.details[0];
          console.log('\nTransaction Details:');
          console.log(`End-to-End ID: ${detail.references.endToEndId}`);
          
          // Display related parties information
          if (detail.relatedParties) {
            if (detail.relatedParties.debtor) {
              console.log(`Debtor: ${detail.relatedParties.debtor.name}`);
              if (detail.relatedParties.debtorAccount) {
                console.log(`Debtor IBAN: ${detail.relatedParties.debtorAccount.iban}`);
              }
            }
            
            if (detail.relatedParties.creditor) {
              console.log(`Creditor: ${detail.relatedParties.creditor.name}`);
              if (detail.relatedParties.creditorAccount) {
                console.log(`Creditor IBAN: ${detail.relatedParties.creditorAccount.iban}`);
              }
            }
          }
          
          // Display remittance information
          if (detail.remittanceInformation && detail.remittanceInformation.structured) {
            const remitInfo = detail.remittanceInformation.structured;
            
            if (remitInfo.creditorReferenceInformation && remitInfo.creditorReferenceInformation.reference) {
              console.log(`Reference: ${remitInfo.creditorReferenceInformation.reference}`);
            }
            
            if (remitInfo.additionalRemittanceInformation.length > 0) {
              console.log(`Additional Info: ${remitInfo.additionalRemittanceInformation.join(', ')}`);
            }
          }
        }
      });
    });
    
    // Save the parsed data as JSON for reference
    const jsonOutputPath = path.join(__dirname, 'sample-camt053-parsed.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(result, null, 2));
    console.log(`\nParsed data saved to: ${jsonOutputPath}`);
    
  } catch (error) {
    console.error('Error processing CAMT file:', error);
  }
}

// Run the demo
processCamtFile()
  .then(() => console.log('\nDemo completed successfully!'))
  .catch(error => console.error('Demo failed:', error)); 