export interface Camt053Document {
  groupHeader: GroupHeader;
  statements: Statement[];
}

export interface GroupHeader {
  msgId: string;
  creDtTm: string;
}

export interface Statement {
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

export interface Account {
  id: {
    iban: string;
  };
  ccy: string;
  nm: string;
  ownr: {
    nm: string;
    pstlAdr: {
      adrLine: string[];
    };
    id: {
      orgId: {
        othr: {
          id: string;
        };
      };
    };
  };
}

export interface Balance {
  tp: {
    cdOrPrtry: {
      cd: string;
    };
  };
  amt: Amount;
  cdtDbtInd: string;
  dt: {
    dt: string;
  };
}

export interface Amount {
  currency: string;
  value: string;
}

export interface TransactionSummary {
  ttlCdtNtries?: {
    nbOfNtries: string;
    sum: string;
  };
  ttlDbtNtries?: {
    nbOfNtries: string;
    sum: string;
  };
}

export interface Entry {
  ntryRef: string;
  amt: Amount;
  cdtDbtInd: string;
  rvslInd: boolean;
  sts: {
    cd: string;
  };
  bookgDt: {
    dt: string;
  };
  valDt: {
    dt: string;
  };
  acctSvcrRef: string;
  bkTxCd: {
    prtry: {
      cd: string;
    };
  };
  ntryDtls: EntryDetails[];
}

export interface EntryDetails {
  txDtls: TransactionDetails[];
}

export interface TransactionDetails {
  refs: {
    acctSvcrRef: string;
    endToEndId: string;
  };
  amtDtls: {
    txAmt: {
      amt: Amount;
    };
  };
  rltdPties?: {
    ultmtDbtr?: {
      pty: Record<string, unknown>;
    };
    cdtr?: {
      pty: {
        nm: string;
        pstlAdr: {
          ctry: string;
          adrLine: string[];
        };
      };
    };
    cdtrAcct?: {
      id: {
        iban: string;
      };
    };
    ultmtCdtr?: {
      pty: Record<string, unknown>;
    };
  };
  rmtInf?: {
    strd: {
      cdtrRefInf: {
        tp: {
          cdOrPrtry: {
            cd: string;
          };
        };
        ref: string;
      };
      addtlRmtInf: string[];
    };
  };
} 