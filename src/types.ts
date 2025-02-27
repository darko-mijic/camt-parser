// Human-readable interfaces for CAMT parser

// Top-level document containing one or more bank statements
export interface BankStatementDocument {
  header: DocumentHeader;
  statements: BankStatement[];
}

// Header information for the document
export interface DocumentHeader {
  messageId: string;          // Unique identifier for the message
  creationDateTime: string;   // Date and time the message was created
}

// Represents a single bank statement
export interface BankStatement {
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

// Bank account details
export interface BankAccount {
  iban: string;               // IBAN of the account
  currency: string;           // Currency of the account
  name: string;               // Name of the account
  owner: AccountOwner;        // Owner details
}

// Account owner information
export interface AccountOwner {
  name: string;               // Owner's name
  address: string[];          // Owner's address lines
  id: string;                 // Owner's identifier
}

// Balance information (e.g., opening or closing balance)
export interface Balance {
  type: string;               // Type of balance (e.g., "OPBD" for opening, "CLBD" for closing)
  amount: Amount;             // Amount and currency
  creditDebitIndicator: string;  // "CRDT" for credit, "DBIT" for debit
  date: string;               // Date of the balance
}

// Amount details
export interface Amount {
  currency: string;           // Currency (e.g., "EUR", "USD")
  value: string;              // Amount as a string to preserve precision
}

// Summary of transactions
export interface TransactionSummary {
  totalCreditEntries?: SummaryDetail;  // Total credit transactions
  totalDebitEntries?: SummaryDetail;   // Total debit transactions
}

export interface SummaryDetail {
  numberOfEntries: string;    // Number of entries
  sum: string;                // Total amount
}

// Individual transaction details
export interface Transaction {
  reference?: string;         // Transaction reference
  amount: Amount;             // Transaction amount
  creditDebitIndicator: string;  // "CRDT" for credit, "DBIT" for debit
  reversalIndicator: boolean;    // Indicates if it's a reversal
  status: string;             // Transaction status (e.g., "BOOK")
  bookingDate: string;        // Date the transaction was booked
  valueDate: string;          // Value date of the transaction
  accountServicerReference: string;  // Reference from the account servicer
  bankTransactionCode: string;       // Bank transaction code
  details: TransactionDetail[];      // Detailed transaction information
}

// Detailed information for each transaction
export interface TransactionDetail {
  references: {
    accountServicerReference: string;  // Servicer reference
    endToEndId: string;                // End-to-end identifier
  };
  amountDetails: {
    transactionAmount: Amount;         // Transaction amount details
  };
  relatedParties?: {
    creditor?: Party;                  // Creditor details (optional)
    creditorAccount?: AccountIdentification;  // Creditor account (optional)
  };
  remittanceInformation?: {
    structured: {
      creditorReferenceInformation: {
        type: string;                  // Reference type
        reference: string;             // Reference value
      };
      additionalRemittanceInformation: string[];  // Additional info
    };
  };
}

// Party (e.g., creditor) details
export interface Party {
  name: string;               // Party name
  postalAddress: {
    country?: string;         // Country (optional)
    addressLine: string[];    // Address lines
  };
}

// Account identification (e.g., creditor account)
export interface AccountIdentification {
  iban: string;               // IBAN of the account
} 