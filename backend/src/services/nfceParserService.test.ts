import { describe, expect, it } from '@jest/globals';
import { NfceParserService } from './nfceParserService';

// Trecho representativo do DANFE NFC-e (consulta pública) que reproduzia o bug:
// a quantidade vem junto do rótulo "Qtde.:", cujo ponto era lido como decimal.
const CUPOM_HTML = `
<table id="tabResult">
  <tr id="Item + 1">
    <td valign="top">
      <span class="txtTit2">BRILHANTE PRO 8kg</span>
      <span class="RCod">(Código: 1200257)</span>
      <br></br>
      <span class="Rqtd">
        <strong>Qtde.:</strong>3
      </span>
      <span class="RUN">
        <strong>UN: </strong>PC
      </span>
      <span class="RvlUnit">
        <strong>Vl. Unit.:</strong> 55,9
      </span>
    </td>
    <td align="right" valign="top" class="txtTit3 noWrap">Vl. Total
      <br></br>
      <span class="valor">167,70</span>
    </td>
  </tr>
  <tr id="Item + 2">
    <td valign="top">
      <span class="txtTit2">SAC ASS VD OXI 58X70</span>
      <span class="RCod">(Código: 1203405)</span>
      <br></br>
      <span class="Rqtd">
        <strong>Qtde.:</strong>3
      </span>
      <span class="RUN">
        <strong>UN: </strong>Un
      </span>
      <span class="RvlUnit">
        <strong>Vl. Unit.:</strong> 0,3
      </span>
    </td>
    <td align="right" valign="top" class="txtTit3 noWrap">Vl. Total
      <br></br>
      <span class="valor">0,90</span>
    </td>
  </tr>
</table>
<div id="totalNota">
  <div id="linhaTotal">
    <label>Qtd. total de itens:</label>
    <span class="totalNumb">2</span>
  </div>
  <div id="linhaTotal">
    <label>Valor total R$:</label>
    <span class="totalNumb">168,60</span>
  </div>
  <div id="linhaTotal">
    <label>Descontos R$:</label>
    <span class="totalNumb">0,00</span>
  </div>
  <div id="linhaTotal">
    <label>Valor a pagar R$:</label>
    <span class="totalNumb">168,60</span>
  </div>
</div>
`;

describe('NfceParserService', () => {
  const parser = new NfceParserService();

  it('lê quantidade e preço unitário do cupom fiscal sem confundir o rótulo "Qtde.:"', async () => {
    const { produtos } = await parser.parseFromHtml(CUPOM_HTML);

    expect(produtos).toHaveLength(2);

    expect(produtos[0]).toMatchObject({
      descricao: 'BRILHANTE PRO 8kg',
      codigo: '1200257',
      quantidade: 3,
      unidade: 'UN: PC',
      valor_unitario: 55.9,
      valor_total: 167.7,
    });
    expect(produtos[0].validation_ok).toBe(true);

    expect(produtos[1]).toMatchObject({
      descricao: 'SAC ASS VD OXI 58X70',
      codigo: '1203405',
      quantidade: 3,
      valor_unitario: 0.3,
      valor_total: 0.9,
    });
    expect(produtos[1].validation_ok).toBe(true);
  });

  it('lê os totais mesmo com o rótulo "Qtd. total de itens"', async () => {
    const { totais } = await parser.parseFromHtml(CUPOM_HTML);

    expect(totais.quantidade_total_itens).toBe(2);
    expect(totais.valor_total).toBe(168.6);
    expect(totais.descontos).toBe(0);
    expect(totais.valor_a_pagar).toBe(168.6);
  });
});
