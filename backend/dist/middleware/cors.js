"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = corsMiddleware;
/**
 * CORS restrito aos origins configurados em CORS_ORIGINS.
 * Ex.: CORS_ORIGINS="http://localhost:3000,https://meuapp.com"
 */
function corsMiddleware(allowedOrigins) {
    const allowAll = allowedOrigins.includes('*');
    return (req, res, next) => {
        const origin = req.headers.origin;
        if (origin && (allowAll || allowedOrigins.includes(origin))) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        return next();
    };
}
