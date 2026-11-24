"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const nfceParserService_1 = require("./nfceParserService");
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
(0, globals_1.describe)('NfceParserService', () => {
    const parser = new nfceParserService_1.NfceParserService();
    (0, globals_1.it)('lê quantidade e preço unitário do cupom fiscal sem confundir o rótulo "Qtde.:"', () => __awaiter(void 0, void 0, void 0, function* () {
        const { produtos } = yield parser.parseFromHtml(CUPOM_HTML);
        (0, globals_1.expect)(produtos).toHaveLength(2);
        (0, globals_1.expect)(produtos[0]).toMatchObject({
            descricao: 'BRILHANTE PRO 8kg',
            codigo: '1200257',
            quantidade: 3,
            unidade: 'UN: PC',
            valor_unitario: 55.9,
            valor_total: 167.7,
        });
        (0, globals_1.expect)(produtos[0].validation_ok).toBe(true);
        (0, globals_1.expect)(produtos[1]).toMatchObject({
            descricao: 'SAC ASS VD OXI 58X70',
            codigo: '1203405',
            quantidade: 3,
            valor_unitario: 0.3,
            valor_total: 0.9,
        });
        (0, globals_1.expect)(produtos[1].validation_ok).toBe(true);
    }));
    (0, globals_1.it)('lê os totais mesmo com o rótulo "Qtd. total de itens"', () => __awaiter(void 0, void 0, void 0, function* () {
        const { totais } = yield parser.parseFromHtml(CUPOM_HTML);
        (0, globals_1.expect)(totais.quantidade_total_itens).toBe(2);
        (0, globals_1.expect)(totais.valor_total).toBe(168.6);
        (0, globals_1.expect)(totais.descontos).toBe(0);
        (0, globals_1.expect)(totais.valor_a_pagar).toBe(168.6);
    }));
});
