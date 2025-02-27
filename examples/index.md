# CAMT Parser Examples

This directory contains examples and documentation for using the `camt-parser` package.

## Contents

- [README.md](./README.md) - General examples of using the package in different environments
- [INSTALLATION.md](./INSTALLATION.md) - Installation guide for different environments
- [sample-camt053.xml](./sample-camt053.xml) - Sample CAMT.053 XML file for testing
- [demo.js](./demo.js) - JavaScript demo script
- [demo.ts](./demo.ts) - TypeScript demo script
- [replit-usage.ts](./replit-usage.ts) - Example of using the package in a Replit project

## Running the Examples

### JavaScript Example

```bash
# Install dependencies
npm install camt-parser

# Run the demo
node demo.js
```

### TypeScript Example

```bash
# Install dependencies
npm install camt-parser
npm install -g ts-node typescript

# Run the demo
ts-node demo.ts
```

## Expected Output

When running the demo scripts, you should see output similar to:

```
Reading CAMT.053 XML file...
Parsing CAMT.053 XML content...

=== Document Information ===
Message ID: STMT20230615001
Creation Date/Time: 2023-06-15T08:30:00

=== Statement #1 ===
Statement ID: STMT2023061500001
Period: 2023-06-01T00:00:00 to 2023-06-15T00:00:00

--- Account Information ---
IBAN: DE89370400440532013000
Currency: EUR
Owner: ACME Corporation
Address: 123 Business Street, 10115 Berlin, Germany

--- Balance Information ---
OPBD Balance: €10,000.00 (CRDT)
Date: 2023-06-01
CLBD Balance: €12,500.50 (CRDT)
Date: 2023-06-15

--- Transactions (3) ---

Transaction #1:
Amount: €1,500.00 (CRDT)
Booking Date: 2023-06-05
Status: BOOK

Transaction Details:
End-to-End ID: E2E-REF-2023060500001
Debtor: Client XYZ Ltd
Debtor IBAN: FR7630006000011234567890189
Reference: INV-2023-0042
Additional Info: Payment for services

...

Parsed data saved to: ./sample-camt053-parsed.json

Demo completed successfully!
```

## Additional Resources

- [CAMT Parser Documentation](https://github.com/darko-mijic/camt-parser)
- [ISO 20022 Standard](https://www.iso20022.org/) 