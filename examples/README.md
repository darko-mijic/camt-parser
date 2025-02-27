# CAMT Parser Examples

This directory contains examples of how to use the `camt-parser` package in different environments.

## Basic Usage

```typescript
import { parseCamt053 } from 'camt-parser';
import { readFileSync } from 'fs';

// Read the CAMT.053 XML file
const xmlContent = readFileSync('path/to/your/camt053.xml', 'utf-8');

// Parse the XML content
parseCamt053(xmlContent)
  .then(result => {
    console.log('Parsed CAMT document:', result);
    
    // Access the document header
    console.log('Message ID:', result.header.messageId);
    
    // Access the first statement
    const statement = result.statements[0];
    console.log('Statement ID:', statement.statementId);
    
    // Access account information
    console.log('IBAN:', statement.account.iban);
    console.log('Account Owner:', statement.account.owner.name);
    
    // Access balances
    statement.balances.forEach(balance => {
      console.log(`Balance (${balance.type}): ${balance.amount.value} ${balance.amount.currency}`);
    });
    
    // Access transactions
    statement.transactions.forEach(transaction => {
      console.log(`Transaction: ${transaction.amount.value} ${transaction.amount.currency} (${transaction.creditDebitIndicator})`);
      console.log(`Date: ${transaction.bookingDate}`);
      
      // Access transaction details
      transaction.details.forEach(detail => {
        if (detail.relatedParties?.creditor) {
          console.log(`Creditor: ${detail.relatedParties.creditor.name}`);
        }
        
        if (detail.remittanceInformation?.structured.additionalRemittanceInformation.length > 0) {
          console.log(`Info: ${detail.remittanceInformation.structured.additionalRemittanceInformation.join(', ')}`);
        }
      });
    });
  })
  .catch(error => {
    console.error('Error parsing CAMT document:', error);
  });
```

## Using with Express.js

```typescript
import express from 'express';
import { parseCamt053 } from 'camt-parser';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.text({ type: 'application/xml' }));

app.post('/parse-camt', async (req, res) => {
  try {
    const xmlContent = req.body;
    const result = await parseCamt053(xmlContent);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Using in a Browser Environment

```html
<!DOCTYPE html>
<html>
<head>
  <title>CAMT Parser Demo</title>
  <script type="module">
    import { parseCamt053 } from 'https://cdn.jsdelivr.net/npm/camt-parser@1.1.0/dist/index.js';
    
    document.getElementById('fileInput').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const xmlContent = e.target.result;
          const result = await parseCamt053(xmlContent);
          
          document.getElementById('output').textContent = JSON.stringify(result, null, 2);
        } catch (error) {
          document.getElementById('output').textContent = `Error: ${error.message}`;
        }
      };
      reader.readAsText(file);
    });
  </script>
</head>
<body>
  <h1>CAMT Parser Demo</h1>
  <input type="file" id="fileInput" accept=".xml" />
  <pre id="output"></pre>
</body>
</html>
```

## Using in a Replit Project

See the [replit-usage.ts](./replit-usage.ts) file for a complete example of how to use the package in a Replit project.

## Additional Resources

- [CAMT Parser Documentation](https://github.com/darko-mijic/camt-parser)
- [ISO 20022 Standard](https://www.iso20022.org/) 