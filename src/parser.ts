import { parseStringPromise } from 'xml2js';
import { Camt053Document, GroupHeader, Statement, Balance, Amount, TransactionSummary, Entry, EntryDetails, TransactionDetails } from './types';

export async function parseCamt053(xml: string): Promise<Camt053Document> {
  const result = await parseStringPromise(xml, {
    explicitArray: false,
    mergeAttrs: true,
  });

  const bkToCstmrStmt = result.Document.BkToCstmrStmt;

  const groupHeader = mapGroupHeader(bkToCstmrStmt.GrpHdr);
  const statements = bkToCstmrStmt.Stmt
    ? Array.isArray(bkToCstmrStmt.Stmt)
      ? bkToCstmrStmt.Stmt.map(mapStatement)
      : [mapStatement(bkToCstmrStmt.Stmt)]
    : [];

  return { groupHeader, statements };
}

function mapGroupHeader(grpHdr: any): GroupHeader {
  return {
    msgId: grpHdr.MsgId,
    creDtTm: grpHdr.CreDtTm,
  };
}

function mapStatement(stmt: any): Statement {
  return {
    id: stmt.Id,
    lglSeqNb: stmt.LglSeqNb,
    creDtTm: stmt.CreDtTm,
    frToDt: {
      frDtTm: stmt.FrToDt.FrDtTm,
      toDtTm: stmt.FrToDt.ToDtTm,
    },
    rptgSrc: {
      prtry: stmt.RptgSrc.Prtry,
    },
    acct: {
      id: {
        iban: stmt.Acct.Id.IBAN,
      },
      ccy: stmt.Acct.Ccy,
      nm: stmt.Acct.Nm,
      ownr: {
        nm: stmt.Acct.Ownr.Nm,
        pstlAdr: {
          adrLine: Array.isArray(stmt.Acct.Ownr.PstlAdr.AdrLine)
            ? stmt.Acct.Ownr.PstlAdr.AdrLine
            : [stmt.Acct.Ownr.PstlAdr.AdrLine],
        },
        id: {
          orgId: {
            othr: {
              id: stmt.Acct.Ownr.Id.OrgId.Othr.Id,
            },
          },
        },
      },
    },
    bal: stmt.Bal ? (Array.isArray(stmt.Bal) ? stmt.Bal.map(mapBalance) : [mapBalance(stmt.Bal)]) : [],
    txsSummry: stmt.TxsSummry ? mapTransactionSummary(stmt.TxsSummry) : undefined,
    ntry: stmt.Ntry ? (Array.isArray(stmt.Ntry) ? stmt.Ntry.map(mapEntry) : [mapEntry(stmt.Ntry)]) : [],
    addtlStmtInf: stmt.AddtlStmtInf,
  };
}

function mapBalance(bal: any): Balance {
  if (!bal || !bal.Tp || !bal.Tp.CdOrPrtry || !bal.Tp.CdOrPrtry.Cd) {
    throw new Error('Invalid balance data: missing required fields');
  }
  
  return {
    tp: {
      cdOrPrtry: {
        cd: bal.Tp.CdOrPrtry.Cd,
      },
    },
    amt: mapAmount(bal.Amt),
    cdtDbtInd: bal.CdtDbtInd,
    dt: {
      dt: bal.Dt.Dt,
    },
  };
}

function mapAmount(amt: any): Amount {
  if (!amt || !amt.Ccy || !amt._) {
    throw new Error('Invalid amount data: missing required fields');
  }
  
  return {
    currency: amt.Ccy,
    value: amt._,
  };
}

function mapTransactionSummary(txsSummry: any): TransactionSummary {
  return {
    ttlCdtNtries: txsSummry.TtlCdtNtries ? {
      nbOfNtries: txsSummry.TtlCdtNtries.NbOfNtries,
      sum: txsSummry.TtlCdtNtries.Sum,
    } : undefined,
    ttlDbtNtries: txsSummry.TtlDbtNtries ? {
      nbOfNtries: txsSummry.TtlDbtNtries.NbOfNtries,
      sum: txsSummry.TtlDbtNtries.Sum,
    } : undefined,
  };
}

function mapEntry(ntry: any): Entry {
  if (!ntry || !ntry.Amt || !ntry.CdtDbtInd || !ntry.Sts || !ntry.Sts.Cd) {
    throw new Error('Invalid entry data: missing required fields');
  }

  return {
    ntryRef: ntry.NtryRef,
    amt: mapAmount(ntry.Amt),
    cdtDbtInd: ntry.CdtDbtInd,
    rvslInd: ntry.RvslInd === 'true',
    sts: {
      cd: ntry.Sts.Cd,
    },
    bookgDt: {
      dt: ntry.BookgDt.Dt,
    },
    valDt: {
      dt: ntry.ValDt.Dt,
    },
    acctSvcrRef: ntry.AcctSvcrRef,
    bkTxCd: {
      prtry: {
        cd: ntry.BkTxCd.Prtry.Cd,
      },
    },
    ntryDtls: Array.isArray(ntry.NtryDtls) ? ntry.NtryDtls.map(mapEntryDetails) : [mapEntryDetails(ntry.NtryDtls)],
  };
}

function mapEntryDetails(ntryDtls: any): EntryDetails {
  if (!ntryDtls || !ntryDtls.TxDtls) {
    throw new Error('Invalid entry details: missing required fields');
  }

  return {
    txDtls: Array.isArray(ntryDtls.TxDtls) ? ntryDtls.TxDtls.map(mapTransactionDetails) : [mapTransactionDetails(ntryDtls.TxDtls)],
  };
}

function mapTransactionDetails(txDtls: any): TransactionDetails {
  if (!txDtls || !txDtls.Refs || !txDtls.AmtDtls || !txDtls.AmtDtls.TxAmt) {
    throw new Error('Invalid transaction details: missing required fields');
  }

  return {
    refs: {
      acctSvcrRef: txDtls.Refs.AcctSvcrRef,
      endToEndId: txDtls.Refs.EndToEndId,
    },
    amtDtls: {
      txAmt: {
        amt: mapAmount(txDtls.AmtDtls.TxAmt.Amt),
      },
    },
    rltdPties: txDtls.RltdPties ? {
      ultmtDbtr: txDtls.RltdPties.UltmtDbtr ? { pty: txDtls.RltdPties.UltmtDbtr.Pty } : undefined,
      cdtr: txDtls.RltdPties.Cdtr ? {
        pty: {
          nm: txDtls.RltdPties.Cdtr.Pty.Nm,
          pstlAdr: {
            ctry: txDtls.RltdPties.Cdtr.Pty.PstlAdr.Ctry,
            adrLine: Array.isArray(txDtls.RltdPties.Cdtr.Pty.PstlAdr.AdrLine)
              ? txDtls.RltdPties.Cdtr.Pty.PstlAdr.AdrLine
              : [txDtls.RltdPties.Cdtr.Pty.PstlAdr.AdrLine],
          },
        },
      } : undefined,
      cdtrAcct: txDtls.RltdPties.CdtrAcct ? {
        id: {
          iban: txDtls.RltdPties.CdtrAcct.Id.IBAN,
        },
      } : undefined,
      ultmtCdtr: txDtls.RltdPties.UltmtCdtr ? { pty: txDtls.RltdPties.UltmtCdtr.Pty } : undefined,
    } : undefined,
    rmtInf: txDtls.RmtInf ? {
      strd: {
        cdtrRefInf: {
          tp: {
            cdOrPrtry: {
              cd: txDtls.RmtInf.Strd.CdtrRefInf.Tp.CdOrPrtry.Cd,
            },
          },
          ref: txDtls.RmtInf.Strd.CdtrRefInf.Ref,
        },
        addtlRmtInf: Array.isArray(txDtls.RmtInf.Strd.AddtlRmtInf)
          ? txDtls.RmtInf.Strd.AddtlRmtInf
          : [txDtls.RmtInf.Strd.AddtlRmtInf],
      },
    } : undefined,
  };
} 