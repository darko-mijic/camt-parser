import { parseCamt053 } from '../src/parser';

describe('parseCamt053', () => {
  it('parses document header correctly', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>BCS_1101537865_20250102_001_978</MsgId>
      <CreDtTm>2025-01-03T00:18:37.874</CreDtTm>
    </GrpHdr>
  </BkToCstmrStmt>
</Document>`;
    const result = await parseCamt053(xml);
    expect(result.header.messageId).toBe('BCS_1101537865_20250102_001_978');
    expect(result.header.creationDateTime).toBe('2025-01-03T00:18:37.874');
  });

  it('parses statement and account details', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>test</MsgId>
      <CreDtTm>2025-01-01</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>BCS_1101537865_20250102_001_978</Id>
      <LglSeqNb>1</LglSeqNb>
      <CreDtTm>2025-01-03T00:18:37.874</CreDtTm>
      <FrToDt>
        <FrDtTm>2025-01-02T00:00:00.000</FrDtTm>
        <ToDtTm>2025-01-02T23:59:59.999</ToDtTm>
      </FrToDt>
      <RptgSrc>
        <Prtry>HAABHR22XXX14036333877</Prtry>
      </RptgSrc>
      <Acct>
        <Id>
          <IBAN>HR1725000091101537865</IBAN>
        </Id>
        <Ccy>EUR</Ccy>
        <Nm>Transakcijski račun poslovnog subjekta</Nm>
        <Ownr>
          <Nm>EBIZ D.O.O.</Nm>
          <PstlAdr>
            <AdrLine>PRISAVLJE 10</AdrLine>
            <AdrLine>ZAGREB</AdrLine>
          </PstlAdr>
          <Id>
            <OrgId>
              <Othr>
                <Id>23732108701</Id>
              </Othr>
            </OrgId>
          </Id>
        </Ownr>
      </Acct>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
    const result = await parseCamt053(xml);
    const stmt = result.statements[0];
    expect(stmt.statementId).toBe('BCS_1101537865_20250102_001_978');
    expect(stmt.account.iban).toBe('HR1725000091101537865');
    expect(stmt.account.owner.name).toBe('EBIZ D.O.O.');
    expect(stmt.account.owner.address).toEqual(['PRISAVLJE 10', 'ZAGREB']);
  });

  it('parses balances and transactions', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>test</MsgId>
      <CreDtTm>2025-01-01</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>test</Id>
      <LglSeqNb>1</LglSeqNb>
      <CreDtTm>2025-01-01</CreDtTm>
      <FrToDt>
        <FrDtTm>2025-01-02T00:00:00</FrDtTm>
        <ToDtTm>2025-01-02T23:59:59</ToDtTm>
      </FrToDt>
      <RptgSrc>
        <Prtry>test</Prtry>
      </RptgSrc>
      <Acct>
        <Id>
          <IBAN>HR1725000091101537865</IBAN>
        </Id>
        <Ccy>EUR</Ccy>
        <Nm>Test</Nm>
        <Ownr>
          <Nm>Test</Nm>
          <PstlAdr>
            <AdrLine>Test</AdrLine>
          </PstlAdr>
          <Id>
            <OrgId>
              <Othr>
                <Id>123</Id>
              </Othr>
            </OrgId>
          </Id>
        </Ownr>
      </Acct>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>OPBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="EUR">1191.59</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt>
          <Dt>2025-01-02</Dt>
        </Dt>
      </Bal>
      <Ntry>
        <NtryRef>7019236935</NtryRef>
        <Amt Ccy="EUR">1158.38</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <RvslInd>false</RvslInd>
        <Sts>
          <Cd>BOOK</Cd>
        </Sts>
        <BookgDt>
          <Dt>2025-01-02</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2025-01-02</Dt>
        </ValDt>
        <AcctSvcrRef>9012530459730985</AcctSvcrRef>
        <BkTxCd>
          <Prtry>
            <Cd>NOTPROVIDED</Cd>
          </Prtry>
        </BkTxCd>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <AcctSvcrRef>9012530459730985</AcctSvcrRef>
              <EndToEndId>HR99</EndToEndId>
            </Refs>
            <AmtDtls>
              <TxAmt>
                <Amt Ccy="EUR">1158.38</Amt>
              </TxAmt>
            </AmtDtls>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
    const result = await parseCamt053(xml);
    const stmt = result.statements[0];
    expect(stmt.balances[0].amount.value).toBe('1191.59');
    expect(stmt.transactions[0].amount.value).toBe('1158.38');
    expect(stmt.transactions[0].details[0].references.endToEndId).toBe('HR99');
  });
}); 