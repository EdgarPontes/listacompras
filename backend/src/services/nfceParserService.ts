import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ProdutoItem {
  descricao: string;
  codigo: string | null;
  quantidade: number | null;
  unidade: string | null;
  valor_unitario: number | null;
  valor_total: number | null;
  validation_ok?: boolean;
}

export interface TotaisNota {
  quantidade_total_itens?: number | null;
  valor_total?: number | null;
  descontos?: number | null;
  valor_a_pagar?: number | null;
  forma_pagamento?: string | null;
}

export interface EmitenteInfo {
  nome?: string | null;
  cnpj?: string | null;
}

export interface NFeMeta {
  numero?: string | null;
  serie?: string | null;
  emissao?: string | null;
  protocolo?: string | null;
  chave_acesso?: string | null;
}

export interface ParseResult {
  emitente: EmitenteInfo;
  produtos: ProdutoItem[];
  totais: TotaisNota;
  nfe: NFeMeta;
}

function parseNumberBR(value?: string | null): number | null {
  if (!value) return null;
  // Remove non-digits except separators and minus
  let v = value
    .replace(/\u00A0/g, ' ') // nbsp
    .replace(/[^0-9.,-]/g, '')
    .trim();
  // If both '.' and ',' exist, assume '.' is thousands and ',' is decimal
  if (v.includes('.') && v.includes(',')) {
    v = v.replace(/\./g, '').replace(/,/g, '.');
  } else if (v.includes(',')) {
    // Only comma -> decimal
    v = v.replace(/,/g, '.');
  }
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

function approxEqual(a: number | null, b: number | null, eps = 0.02): boolean | undefined {
  if (a == null || b == null) return undefined;
  return Math.abs(a - b) <= eps;
}

export class NfceParserService {
  async parseFromUrl(url: string): Promise<ParseResult> {
    const resp = await axios.get(url, { responseType: 'text' });
    return this.parseFromHtml(resp.data);
  }

  async parseFromHtml(html: string): Promise<ParseResult> {
    const $ = cheerio.load(html);

    // Produtos
    const produtos: ProdutoItem[] = [];
    $('#tabResult tr[id^="Item"]').each((_: number, tr: any) => {
      const row = $(tr);
      const descricao = row.find('span.txtTit2').first().text().trim();
      const codigo = row.find('span.RCod').first().text().trim() || null;
      const quantidade = parseNumberBR(row.find('span.Rqtd').first().text());
      const unidade = (row.find('span.RUN').first().text().trim() || null);
      const valor_unitario = parseNumberBR(row.find('span.RvlUnit').first().text());
      const valor_total = parseNumberBR(row.find('span.valor').first().text());

      const validation_ok = approxEqual(
        quantidade != null && valor_unitario != null ? quantidade * valor_unitario : null,
        valor_total
      );

      if (descricao) {
        produtos.push({
          descricao,
          codigo,
          quantidade,
          unidade,
          valor_unitario,
          valor_total,
          validation_ok,
        });
      }
    });

    // Totais
    const totais: TotaisNota = {};
    const totalBlock = $('#totalNota');
    if (totalBlock.length) {
      // We try to find common labels. Different portals may vary; use robust selectors.
      const text = totalBlock.text();
      // Try to locate by nearby spans strong/labels
      const getNearNumber = (selector: string): number | null => {
        const el = totalBlock.find(selector).first();
        if (!el.length) return null;
        return parseNumberBR(el.text());
      };

      // Common classes/ids are not guaranteed; fallback to regex on text
      totais.quantidade_total_itens = getNearNumber('#QtdTotalItens, .QtdTotalItens') ??
        parseNumberBR((/Quantidade\s*total\s*de\s*itens\s*[:\-]?\s*([0-9.,]+)/i.exec(text)?.[1]) || null);

      totais.valor_total = getNearNumber('#ValorTotal, .ValorTotal') ??
        parseNumberBR((/Valor\s*Total\s*[:\-]?\s*([0-9.,]+)/i.exec(text)?.[1]) || null);

      totais.descontos = getNearNumber('#Descontos, .Descontos') ??
        parseNumberBR((/Descontos?\s*[:\-]?\s*([0-9.,]+)/i.exec(text)?.[1]) || null);

      totais.valor_a_pagar = getNearNumber('#ValorAPagar, .ValorAPagar') ??
        parseNumberBR((/Valor\s*a\s*pagar\s*[:\-]?\s*([0-9.,]+)/i.exec(text)?.[1]) || null);

      const formaPg = totalBlock.find('#FormaPagamento, .FormaPagamento').first().text().trim();
      totais.forma_pagamento = formaPg || (/(Forma\s*de\s*Pagamento|Pagamento)\s*[:\-]?\s*([^\n]+)/i.exec(text)?.[2]?.trim() || null);
    }

    // Emitente & Meta
    const emitente: EmitenteInfo = {};
    const nfe: NFeMeta = {};

    const infos = $('#infos');
    if (infos.length) {
      const infosText = infos.text();

      // Emitente name might be in a specific tag; fallback to first strong header
      const emitenteNome = infos.find('.emitente, #emitente, h3, h4').first().text().trim();
      if (emitenteNome) emitente.nome = emitenteNome;

      const cnpj = /CNPJ\s*[:\-]?\s*([0-9./-]+)/i.exec(infosText)?.[1] || null;
      if (cnpj) emitente.cnpj = cnpj;

      nfe.numero = /N[ºo]\s*[:\-]?\s*(\d+)/i.exec(infosText)?.[1] || null;
      nfe.serie = /S[ée]rie\s*[:\-]?\s*(\d+)/i.exec(infosText)?.[1] || null;
      nfe.emissao = /(Emiss[aã]o|Data\s*de\s*Emiss[aã]o)\s*[:\-]?\s*([0-9\/ :]+)/i.exec(infosText)?.[2] || null;
      nfe.protocolo = /Protocolo\s*de\s*Autoriza[cç][aã]o\s*[:\-]?\s*(\d+)/i.exec(infosText)?.[1] || null;

      // Chave de acesso may be spaced groups of 4
      const chaveMatch = /(\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4})/.exec(infosText);
      nfe.chave_acesso = chaveMatch?.[1] || null;
    }

    const result: ParseResult = {
      emitente,
      produtos,
      totais,
      nfe,
    };

    return result;
  }
}
