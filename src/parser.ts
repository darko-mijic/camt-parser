import { parseStringPromise } from 'xml2js';
import {
  BankStatementDocument, DocumentHeader, BankStatement, BankAccount, AccountOwner,
  Balance, Amount, TransactionSummary, SummaryDetail, Transaction, TransactionDetail,
  Party, AccountIdentification
} from './types';

// Parse the CAMT XML into a BankStatementDocument
export async function parseCamt053(xml: string): Promise<BankStatementDocument> {
  const result = await parseStringPromise(xml, {
    explicitArray: false,
    mergeAttrs: true,
  });

  const bkToCstmrStmt = result.Document.BkToCstmrStmt;

  const header = mapDocumentHeader(bkToCstmrStmt.GrpHdr);
  const statements = bkToCstmrStmt.Stmt
    ? Array.isArray(bkToCstmrStmt.Stmt)
      ? bkToCstmrStmt.Stmt.map(mapStatement)
      : [mapStatement(bkToCstmrStmt.Stmt)]
    : [];

  return { header, statements };
}

// Map document header
function mapDocumentHeader(grpHdr: any): DocumentHeader {
  return {
    messageId: grpHdr.MsgId,
    creationDateTime: grpHdr.CreDtTm,
  };
}

// Map individual bank statement
function mapStatement(stmt: any): BankStatement {
  return {
    statementId: stmt.Id,                    // Bank statement number
    sequenceNumber: stmt.LglSeqNb || '',
    creationDateTime: stmt.CreDtTm || '',
    fromDateTime: stmt.FrToDt?.FrDtTm || '',
    toDateTime: stmt.FrToDt?.ToDtTm || '',   // Bank statement date
    reportingSource: stmt.RptgSrc?.Prtry || '',
    account: mapBankAccount(stmt.Acct),      // Bank account details
    balances: stmt.Bal ? (Array.isArray(stmt.Bal) ? stmt.Bal.map(mapBalance) : [mapBalance(stmt.Bal)]) : [],
    transactionSummary: stmt.TxsSummry ? mapTransactionSummary(stmt.TxsSummry) : undefined,
    transactions: stmt.Ntry ? (Array.isArray(stmt.Ntry) ? stmt.Ntry.map(mapTransaction) : [mapTransaction(stmt.Ntry)]) : [],
    additionalInfo: stmt.AddtlStmtInf,
  };
}

// Map bank account details
function mapBankAccount(acct: any): BankAccount {
  if (!acct) {
    throw new Error('Missing account information');
  }
  
  return {
    iban: acct.Id?.IBAN || '',               // IBAN
    currency: acct.Ccy || '',
    name: acct.Nm || '',
    owner: mapAccountOwner(acct.Ownr),
  };
}

// Map account owner
function mapAccountOwner(ownr: any): AccountOwner {
  if (!ownr) {
    return {
      name: '',
      address: [],
      id: '',
    };
  }
  
  return {
    name: ownr.Nm || '',
    address: ownr.PstlAdr?.AdrLine 
      ? (Array.isArray(ownr.PstlAdr.AdrLine) 
          ? ownr.PstlAdr.AdrLine 
          : [ownr.PstlAdr.AdrLine])
      : [],
    id: ownr.Id?.OrgId?.Othr?.Id || '',
  };
}

// Map balance (e.g., opening or closing)
function mapBalance(bal: any): Balance {
  if (!bal) {
    throw new Error('Invalid balance data: missing required fields');
  }
  
  return {
    type: bal.Tp?.CdOrPrtry?.Cd || '',       // "OPBD" or "CLBD"
    amount: mapAmount(bal.Amt),
    creditDebitIndicator: bal.CdtDbtInd || '',
    date: bal.Dt?.Dt || bal.Dt?.DtTm || '',  // Handle both date formats
  };
}

// Map amount
function mapAmount(amt: any): Amount {
  if (!amt) {
    return {
      currency: '',
      value: '',
    };
  }
  
  return {
    currency: amt.Ccy || '',
    value: amt._ || '',
  };
}

// Map transaction summary
function mapTransactionSummary(txsSummry: any): TransactionSummary {
  if (!txsSummry) {
    return {
      totalCreditEntries: undefined,
      totalDebitEntries: undefined,
    };
  }
  
  return {
    totalCreditEntries: txsSummry.TtlCdtNtries ? {
      numberOfEntries: txsSummry.TtlCdtNtries.NbOfNtries || '',
      sum: txsSummry.TtlCdtNtries.Sum || '',
    } : undefined,
    totalDebitEntries: txsSummry.TtlDbtNtries ? {
      numberOfEntries: txsSummry.TtlDbtNtries.NbOfNtries || '',
      sum: txsSummry.TtlDbtNtries.Sum || '',
    } : undefined,
  };
}

// Map individual transaction
function mapTransaction(ntry: any): Transaction {
  if (!ntry) {
    throw new Error('Invalid transaction data: missing required fields');
  }

  return {
    reference: ntry.NtryRef,
    amount: mapAmount(ntry.Amt),
    creditDebitIndicator: ntry.CdtDbtInd || '',
    reversalIndicator: ntry.RvslInd === 'true',
    status: ntry.Sts?.Cd || '',
    bookingDate: ntry.BookgDt?.DtTm || ntry.BookgDt?.Dt || '',
    valueDate: ntry.ValDt?.DtTm || ntry.ValDt?.Dt || '',
    accountServicerReference: ntry.AcctSvcrRef || '',
    bankTransactionCode: ntry.BkTxCd?.Prtry?.Cd || '',
    details: mapTransactionDetails(ntry.NtryDtls),
  };
}

// Map transaction details array
function mapTransactionDetails(ntryDtls: any): TransactionDetail[] {
  if (!ntryDtls) {
    return [];
  }
  
  if (Array.isArray(ntryDtls)) {
    return ntryDtls.flatMap((dtls: any) => 
      Array.isArray(dtls.TxDtls) 
        ? dtls.TxDtls.map(mapTransactionDetail) 
        : [mapTransactionDetail(dtls.TxDtls)]
    );
  }
  
  return Array.isArray(ntryDtls.TxDtls)
    ? ntryDtls.TxDtls.map(mapTransactionDetail)
    : [mapTransactionDetail(ntryDtls.TxDtls)];
}

// Map transaction detail
function mapTransactionDetail(txDtls: any): TransactionDetail {
  if (!txDtls) {
    return {
      references: {
        accountServicerReference: '',
        endToEndId: '',
      },
      amountDetails: {
        transactionAmount: { currency: '', value: '' },
      },
    };
  }

  return {
    references: {
      accountServicerReference: txDtls.Refs?.AcctSvcrRef || '',
      endToEndId: txDtls.Refs?.EndToEndId || '',
    },
    amountDetails: {
      transactionAmount: txDtls.AmtDtls?.TxAmt?.Amt 
        ? mapAmount(txDtls.AmtDtls.TxAmt.Amt)
        : { currency: '', value: '' },
    },
    relatedParties: txDtls.RltdPties ? {
      debtor: txDtls.RltdPties.Dbtr ? {
        name: txDtls.RltdPties.Dbtr.Pty?.Nm || '',
        postalAddress: {
          country: txDtls.RltdPties.Dbtr.Pty?.PstlAdr?.Ctry,
          addressLine: txDtls.RltdPties.Dbtr.Pty?.PstlAdr?.AdrLine
            ? (Array.isArray(txDtls.RltdPties.Dbtr.Pty.PstlAdr.AdrLine)
                ? txDtls.RltdPties.Dbtr.Pty.PstlAdr.AdrLine
                : [txDtls.RltdPties.Dbtr.Pty.PstlAdr.AdrLine])
            : [],
        },
      } : undefined,
      debtorAccount: txDtls.RltdPties.DbtrAcct ? {
        iban: txDtls.RltdPties.DbtrAcct.Id?.IBAN || '',
      } : undefined,
      creditor: txDtls.RltdPties.Cdtr ? {
        name: txDtls.RltdPties.Cdtr.Pty?.Nm || '',
        postalAddress: {
          country: txDtls.RltdPties.Cdtr.Pty?.PstlAdr?.Ctry,
          addressLine: txDtls.RltdPties.Cdtr.Pty?.PstlAdr?.AdrLine
            ? (Array.isArray(txDtls.RltdPties.Cdtr.Pty.PstlAdr.AdrLine)
                ? txDtls.RltdPties.Cdtr.Pty.PstlAdr.AdrLine
                : [txDtls.RltdPties.Cdtr.Pty.PstlAdr.AdrLine])
            : [],
        },
      } : undefined,
      creditorAccount: txDtls.RltdPties.CdtrAcct ? {
        iban: txDtls.RltdPties.CdtrAcct.Id?.IBAN || '',
      } : undefined,
    } : undefined,
    remittanceInformation: txDtls.RmtInf?.Strd ? {
      structured: {
        creditorReferenceInformation: {
          type: txDtls.RmtInf.Strd.CdtrRefInf?.Tp?.CdOrPrtry?.Cd || '',
          reference: txDtls.RmtInf.Strd.CdtrRefInf?.Ref || '',
        },
        additionalRemittanceInformation: txDtls.RmtInf.Strd.AddtlRmtInf
          ? (Array.isArray(txDtls.RmtInf.Strd.AddtlRmtInf)
              ? txDtls.RmtInf.Strd.AddtlRmtInf
              : [txDtls.RmtInf.Strd.AddtlRmtInf])
          : [],
      },
    } : undefined,
  };
} 