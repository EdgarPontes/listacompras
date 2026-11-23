import { Router } from 'express';
import { AuthService } from '../services/authService';
import { authMiddleware } from '../middleware/authMiddleware';
import { rateLimit } from '../middleware/rateLimit';
import { requireString } from '../utils/validation';

const router = Router();
const authService = new AuthService();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Muitas tentativas de autenticação. Aguarde alguns minutos.',
  // Limita por e-mail (protege contra força bruta por conta) e,
  // na ausência de e-mail, por IP.
  keyGenerator: req => {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return email ? `email:${email}` : `ip:${req.ip ?? 'unknown'}`;
  },
});

router.post('/register', authLimiter, async (req, res) => {
  const email = requireString(req.body?.email, 'email', { email: true, max: 254 });
  const password = requireString(req.body?.password, 'password', { min: 6, max: 128 });

  const user = await authService.register(email, password);
  res.status(201).json(user);
});

router.post('/login', authLimiter, async (req, res) => {
  const email = requireString(req.body?.email, 'email', { email: true, max: 254 });
  const password = requireString(req.body?.password, 'password', { min: 1, max: 128 });

  const { user, token } = await authService.login(email, password);
  res.json({ user, token });
});

// Busca usada pelo fluxo de compartilhamento. Requer autenticação e
// retorna apenas dados públicos do usuário (sem password_hash).
router.get('/users', authMiddleware, async (req, res) => {
  const email = requireString(req.query.email, 'email', { email: true, max: 254 });
  const user = await authService.getUserByEmail(email);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  return res.json(user);
});

export default router;
