# camt-parser

A TypeScript library for parsing bank statements in the SEPA CAMT (ISO 20022) format with human-readable interfaces.

## Introduction

`camt-parser` is designed to parse XML bank statements in the CAMT format, specifically version `camt.053.001.08`. It provides a structured, typed representation of statement data, including account details, balances, and transactions. Version 1.1.0 introduces human-readable interfaces that make working with CAMT data more intuitive.

## Features

- Human-readable interfaces with intuitive property names
- Full TypeScript support with comprehensive type definitions
- Parses CAMT.053.001.08 XML format
- Handles both single and multiple statements
- Supports optional fields and arrays
- Comprehensive test coverage
- Zero production dependencies (except xml2js)

## Installation

```bash
npm install camt-parser
```

## Usage

### Basic Example

```typescript
import { parseCamt053 } from 'camt-parser';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>BCS_1101537865_20250102_001_978</MsgId>
      <CreDtTm>2025-01-03T00:18:37.874</CreDtTm>
    </GrpHdr>
    <!-- Rest of the XML -->
  </BkToCstmrStmt>
</Document>`;

async function parseStatement() {
  try {
    const document = await parseCamt053(xml);
    console.log('Message ID:', document.header.messageId);
    console.log('IBAN:', document.statements[0].account.iban);
    console.log('Transactions:', document.statements[0].transactions);
  } catch (error) {
    console.error('Error parsing CAMT XML:', error);
  }
}

parseStatement();
```

### Accessing Statement Data

The parser provides strongly-typed access to all statement data with human-readable property names:

```typescript
import { parseCamt053, BankStatementDocument } from 'camt-parser';

async function processStatement(xml: string) {
  const doc: BankStatementDocument = await parseCamt053(xml);
  
  // Access document header information
  console.log('Message ID:', doc.header.messageId);
  console.log('Creation Time:', doc.header.creationDateTime);
  
  // Process each statement
  doc.statements.forEach(stmt => {
    console.log('Statement ID:', stmt.statementId);
    console.log('Statement Date:', stmt.toDateTime);
    console.log('Account IBAN:', stmt.account.iban);
    console.log('Account Owner:', stmt.account.owner.name);
    
    // Find opening and closing balances
    const openingBalance = stmt.balances.find(bal => bal.type === 'OPBD');
    const closingBalance = stmt.balances.find(bal => bal.type === 'CLBD');
    
    if (openingBalance) {
      console.log('Opening Balance:', openingBalance.amount.value, openingBalance.amount.currency);
    }
    
    if (closingBalance) {
      console.log('Closing Balance:', closingBalance.amount.value, closingBalance.amount.currency);
    }
    
    // Process transactions
    stmt.transactions.forEach(tx => {
      console.log('Transaction Amount:', tx.amount.value, tx.amount.currency);
      console.log('Credit/Debit:', tx.creditDebitIndicator);
      console.log('Status:', tx.status);
      console.log('Booking Date:', tx.bookingDate);
      
      // Process transaction details
      tx.details.forEach(detail => {
        console.log('End-to-End ID:', detail.references.endToEndId);
        
        if (detail.relatedParties?.creditor) {
          console.log('Creditor:', detail.relatedParties.creditor.name);
        }
        
        if (detail.relatedParties?.creditorAccount) {
          console.log('Creditor IBAN:', detail.relatedParties.creditorAccount.iban);
        }
      });
    });
  });
}
```

## API Reference

### Main Function

#### `parseCamt053(xml: string): Promise<BankStatementDocument>`

Parses a CAMT.053 XML string and returns a Promise resolving to a structured document object.

### Main Interfaces

#### `BankStatementDocument`
```typescript
interface BankStatementDocument {
  header: DocumentHeader;
  statements: BankStatement[];
}
```

#### `DocumentHeader`
```typescript
interface DocumentHeader {
  messageId: string;          // Unique identifier for the message
  creationDateTime: string;   // Date and time the message was created
}
```

#### `BankStatement`
```typescript
interface BankStatement {
  statementId: string;        // Bank statement number or ID
  sequenceNumber: string;     // Sequence number of the statement
  creationDateTime: string;   // Date and time the statement was created
  fromDateTime: string;       // Start date of the statement period
  toDateTime: string;         // End date of the statement period (bank statement date)
  reportingSource: string;    // Source of the reporting
  account: BankAccount;       // Bank account details
  balances: Balance[];        // List of balances (opening, closing, etc.)
  transactionSummary?: TransactionSummary;  // Summary of transactions (optional)
  transactions: Transaction[];              // List of transactions
  additionalInfo?: string;    // Additional statement information (optional)
}
```

See source code for complete interface definitions.

## Key Information Access

The human-readable interfaces make it easy to access key information:

```typescript
// Bank statement date
const statementDate = statement.toDateTime;

// Bank statement number
const statementNumber = statement.statementId;

// Bank account details
const iban = statement.account.iban;
const currency = statement.account.currency;
const accountName = statement.account.name;

// Initial (opening) balance
const openingBalance = statement.balances.find(b => b.type === 'OPBD')?.amount.value;
const openingBalanceCurrency = statement.balances.find(b => b.type === 'OPBD')?.amount.currency;

// New (closing) balance
const closingBalance = statement.balances.find(b => b.type === 'CLBD')?.amount.value;
const closingBalanceCurrency = statement.balances.find(b => b.type === 'CLBD')?.amount.currency;

// Transactions
const transactions = statement.transactions.map(tx => ({
  amount: tx.amount.value,
  currency: tx.amount.currency,
  type: tx.creditDebitIndicator,
  bookingDate: tx.bookingDate,
  valueDate: tx.valueDate,
  reference: tx.reference,
  creditorName: tx.details[0]?.relatedParties?.creditor?.name,
}));
```

## Error Handling

The parser throws errors in the following cases:
- Invalid XML syntax
- Missing required fields
- Unexpected XML structure

Example error handling:

```typescript
try {
  const document = await parseCamt053(xml);
  // Process document
} catch (error) {
  if (error instanceof Error) {
    console.error('Parsing error:', error.message);
  }
}
```

## Version Support

The parser is primarily designed for CAMT.053.001.08 but is structured to handle variations in older versions used by EU banks. The flexible design accommodates:

- Optional fields
- Array vs single element variations
- Different namespace versions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 