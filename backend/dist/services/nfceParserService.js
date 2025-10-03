"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfceParserService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
function parseNumberBR(value) {
    if (!value)
        return null;
    // Remove non-digits except separators and minus
    let v = value
        .replace(/\u00A0/g, ' ') // nbsp
        .replace(/[^0-9.,-]/g, '')
        .trim();
    // If both '.' and ',' exist, assume '.' is thousands and ',' is decimal
    if (v.includes('.') && v.includes(',')) {
        v = v.replace(/\./g, '').replace(/,/g, '.');
    }
    else if (v.includes(',')) {
        // Only comma -> decimal
        v = v.replace(/,/g, '.');
    }
    const num = Number(v);
    return Number.isFinite(num) ? num : null;
}
function approxEqual(a, b, eps = 0.02) {
    if (a == null || b == null)
        return undefined;
    return Math.abs(a - b) <= eps;
}
class NfceParserService {
    parseFromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield axios_1.default.get(url, { responseType: 'text' });
            return this.parseFromHtml(resp.data);
        });
    }
    parseFromHtml(html) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const $ = cheerio.load(html);
            // Produtos
            const produtos = [];
            $('#tabResult tr[id^="Item"]').each((_, tr) => {
                const row = $(tr);
                const descricao = row.find('span.txtTit2').first().text().trim();
                const codigo = row.find('span.RCod').first().text().trim() || null;
                const quantidade = parseNumberBR(row.find('span.Rqtd').first().text());
                const unidade = (row.find('span.RUN').first().text().trim() || null);
                const valor_unitario = parseNumberBR(row.find('span.RvlUnit').first().text());
                const valor_total = parseNumberBR(row.find('span.valor').first().text());
                const validation_ok = approxEqual(quantidade != null && valor_unitario != null ? quantidade * valor_unitario : null, valor_total);
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
            const totais = {};
            const totalBlock = $('#totalNota');
            if (totalBlock.length) {
                // We try to find common labels. Different portals may vary; use robust selectors.
                const text = totalBlock.text();
                // Try to locate by nearby spans strong/labels
                const getNearNumber = (selector) => {
                    const el = totalBlock.find(selector).first();
                    if (!el.length)
                        return null;
                    return parseNumberBR(el.text());
                };
                // Common classes/ids are not guaranteed; fallback to regex on text
                totais.quantidade_total_itens = (_a = getNearNumber('#QtdTotalItens, .QtdTotalItens')) !== null && _a !== void 0 ? _a : parseNumberBR(((_b = /Quantidade\s*total\s*de\s*itens\s*[:\-]?\s*([0-9.,]+)/i.exec(text)) === null || _b === void 0 ? void 0 : _b[1]) || null);
                totais.valor_total = (_c = getNearNumber('#ValorTotal, .ValorTotal')) !== null && _c !== void 0 ? _c : parseNumberBR(((_d = /Valor\s*Total\s*[:\-]?\s*([0-9.,]+)/i.exec(text)) === null || _d === void 0 ? void 0 : _d[1]) || null);
                totais.descontos = (_e = getNearNumber('#Descontos, .Descontos')) !== null && _e !== void 0 ? _e : parseNumberBR(((_f = /Descontos?\s*[:\-]?\s*([0-9.,]+)/i.exec(text)) === null || _f === void 0 ? void 0 : _f[1]) || null);
                totais.valor_a_pagar = (_g = getNearNumber('#ValorAPagar, .ValorAPagar')) !== null && _g !== void 0 ? _g : parseNumberBR(((_h = /Valor\s*a\s*pagar\s*[:\-]?\s*([0-9.,]+)/i.exec(text)) === null || _h === void 0 ? void 0 : _h[1]) || null);
                const formaPg = totalBlock.find('#FormaPagamento, .FormaPagamento').first().text().trim();
                totais.forma_pagamento = formaPg || (((_k = (_j = /(Forma\s*de\s*Pagamento|Pagamento)\s*[:\-]?\s*([^\n]+)/i.exec(text)) === null || _j === void 0 ? void 0 : _j[2]) === null || _k === void 0 ? void 0 : _k.trim()) || null);
            }
            // Emitente & Meta
            const emitente = {};
            const nfe = {};
            const infos = $('#infos');
            if (infos.length) {
                const infosText = infos.text();
                // Emitente name might be in a specific tag; fallback to first strong header
                const emitenteNome = infos.find('.emitente, #emitente, h3, h4').first().text().trim();
                if (emitenteNome)
                    emitente.nome = emitenteNome;
                const cnpj = ((_l = /CNPJ\s*[:\-]?\s*([0-9./-]+)/i.exec(infosText)) === null || _l === void 0 ? void 0 : _l[1]) || null;
                if (cnpj)
                    emitente.cnpj = cnpj;
                nfe.numero = ((_m = /N[ºo]\s*[:\-]?\s*(\d+)/i.exec(infosText)) === null || _m === void 0 ? void 0 : _m[1]) || null;
                nfe.serie = ((_o = /S[ée]rie\s*[:\-]?\s*(\d+)/i.exec(infosText)) === null || _o === void 0 ? void 0 : _o[1]) || null;
                nfe.emissao = ((_p = /(Emiss[aã]o|Data\s*de\s*Emiss[aã]o)\s*[:\-]?\s*([0-9\/ :]+)/i.exec(infosText)) === null || _p === void 0 ? void 0 : _p[2]) || null;
                nfe.protocolo = ((_q = /Protocolo\s*de\s*Autoriza[cç][aã]o\s*[:\-]?\s*(\d+)/i.exec(infosText)) === null || _q === void 0 ? void 0 : _q[1]) || null;
                // Chave de acesso may be spaced groups of 4
                const chaveMatch = /(\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4}\s\d{4})/.exec(infosText);
                nfe.chave_acesso = (chaveMatch === null || chaveMatch === void 0 ? void 0 : chaveMatch[1]) || null;
            }
            const result = {
                emitente,
                produtos,
                totais,
                nfe,
            };
            return result;
        });
    }
}
exports.NfceParserService = NfceParserService;
