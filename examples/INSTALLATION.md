# Installing CAMT Parser

This guide provides instructions for installing and setting up the `camt-parser` package in different environments.

## Node.js / TypeScript Project

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

Using npm:

```bash
npm install camt-parser
```

Using yarn:

```bash
yarn add camt-parser
```

### Usage in TypeScript

```typescript
import { parseCamt053, BankStatementDocument } from 'camt-parser';

// Parse a CAMT.053 XML string
async function parseStatement(xmlContent: string): Promise<BankStatementDocument> {
  try {
    const result = await parseCamt053(xmlContent);
    return result;
  } catch (error) {
    console.error('Error parsing CAMT document:', error);
    throw error;
  }
}
```

### Usage in JavaScript

```javascript
const { parseCamt053 } = require('camt-parser');

// Parse a CAMT.053 XML string
async function parseStatement(xmlContent) {
  try {
    const result = await parseCamt053(xmlContent);
    return result;
  } catch (error) {
    console.error('Error parsing CAMT document:', error);
    throw error;
  }
}
```

## Replit Project

### Setting Up in Replit

1. Create a new Replit project (Node.js or TypeScript template)
2. Open the Shell tab and run:

```bash
npm install camt-parser
```

3. Create a new file (e.g., `index.ts` or `index.js`) and import the package:

```typescript
import { parseCamt053 } from 'camt-parser';
// Rest of your code
```

4. For TypeScript projects, make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "module": "commonjs",
    "target": "es2020"
  }
}
```

## Browser Usage

### Using via CDN

You can use the package directly in the browser via a CDN:

```html
<script type="module">
  import { parseCamt053 } from 'https://cdn.jsdelivr.net/npm/camt-parser@1.1.0/dist/index.js';
  
  // Your code here
</script>
```

### Using with Bundlers (Webpack, Rollup, etc.)

If you're using a bundler like Webpack or Rollup, install the package as usual:

```bash
npm install camt-parser
```

Then import it in your code:

```javascript
import { parseCamt053 } from 'camt-parser';
```

## Troubleshooting

### Common Issues

1. **TypeScript Type Errors**

   If you encounter TypeScript errors, make sure you're using TypeScript version 4.5 or higher.

2. **XML Parsing Errors**

   The package expects valid CAMT.053 XML format. If you encounter parsing errors, verify that your XML conforms to the ISO 20022 CAMT.053 standard.

3. **Module Not Found Error**

   If you get a "Cannot find module 'camt-parser'" error, ensure that:
   - The package is correctly installed
   - You're using the correct import syntax for your environment
   - Your bundler/transpiler is configured correctly

### Getting Help

If you encounter issues not covered here, please:

1. Check the [GitHub repository](https://github.com/darko-mijic/camt-parser) for known issues
2. Open a new issue if your problem hasn't been reported 