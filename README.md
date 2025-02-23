# camt-parser

A TypeScript library for parsing bank statements in the SEPA CAMT (ISO 20022) format.

## Introduction

`camt-parser` is designed to parse XML bank statements in the CAMT format, specifically version `camt.053.001.08`. It provides a structured, typed representation of statement data, including account details, balances, and transactions.

## Features

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
    console.log('Message ID:', document.groupHeader.msgId);
    console.log('IBAN:', document.statements[0].acct.id.iban);
    console.log('Transactions:', document.statements[0].ntry);
  } catch (error) {
    console.error('Error parsing CAMT XML:', error);
  }
}

parseStatement();
```

### Accessing Statement Data

The parser provides strongly-typed access to all statement data:

```typescript
import { parseCamt053, Camt053Document } from 'camt-parser';

async function processStatement(xml: string) {
  const doc: Camt053Document = await parseCamt053(xml);
  
  // Access group header information
  console.log('Message ID:', doc.groupHeader.msgId);
  console.log('Creation Time:', doc.groupHeader.creDtTm);
  
  // Process each statement
  doc.statements.forEach(stmt => {
    console.log('Statement ID:', stmt.id);
    console.log('Account IBAN:', stmt.acct.id.iban);
    console.log('Account Owner:', stmt.acct.ownr.nm);
    
    // Process balances
    stmt.bal.forEach(bal => {
      console.log('Balance:', bal.amt.value, bal.amt.currency);
      console.log('Balance Type:', bal.tp.cdOrPrtry.cd);
    });
    
    // Process transactions
    stmt.ntry.forEach(entry => {
      console.log('Transaction Amount:', entry.amt.value, entry.amt.currency);
      console.log('Credit/Debit:', entry.cdtDbtInd);
      console.log('Status:', entry.sts.cd);
    });
  });
}
```

## API Reference

### Main Function

#### `parseCamt053(xml: string): Promise<Camt053Document>`

Parses a CAMT.053 XML string and returns a Promise resolving to a structured document object.

### Main Interfaces

#### `Camt053Document`
```typescript
interface Camt053Document {
  groupHeader: GroupHeader;
  statements: Statement[];
}
```

#### `GroupHeader`
```typescript
interface GroupHeader {
  msgId: string;
  creDtTm: string;
}
```

#### `Statement`
```typescript
interface Statement {
  id: string;
  lglSeqNb: string;
  creDtTm: string;
  frToDt: {
    frDtTm: string;
    toDtTm: string;
  };
  rptgSrc: {
    prtry: string;
  };
  acct: Account;
  bal: Balance[];
  txsSummry?: TransactionSummary;
  ntry: Entry[];
  addtlStmtInf?: string;
}
```

See source code for complete interface definitions.

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