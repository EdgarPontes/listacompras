"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
/**
 * Rate limiter simples em memória (suficiente para uma instância única).
 * Para múltiplas instâncias em produção, use um store compartilhado.
 */
function rateLimit({ windowMs, max, message, keyGenerator }) {
    var _a;
    const buckets = new Map();
    // Limpeza periódica para evitar crescimento indefinido do Map.
    const cleaner = setInterval(() => {
        const now = Date.now();
        for (const [key, bucket] of buckets) {
            if (bucket.resetAt <= now)
                buckets.delete(key);
        }
    }, windowMs);
    (_a = cleaner.unref) === null || _a === void 0 ? void 0 : _a.call(cleaner);
    return (req, res, next) => {
        var _a, _b;
        const key = keyGenerator
            ? keyGenerator(req)
            : ((_b = (_a = req.ip) !== null && _a !== void 0 ? _a : req.socket.remoteAddress) !== null && _b !== void 0 ? _b : 'unknown');
        const now = Date.now();
        const bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        if (bucket.count >= max) {
            const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
            res.setHeader('Retry-After', String(retryAfter));
            return res.status(429).json({
                error: message !== null && message !== void 0 ? message : 'Muitas requisições. Tente novamente mais tarde.',
            });
        }
        bucket.count += 1;
        return next();
    };
}
