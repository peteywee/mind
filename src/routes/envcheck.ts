import { Router } from 'express';
const router = Router();
router.get('/envcheck', (_req, res) => {
  const present = (v?: string) => Boolean(v && v.trim().length > 0);
  res.json({ env: {
    GEMINI_API_KEY: present(process.env.GEMINI_API_KEY),
    SERPAPI_KEY: present(process.env.SERPAPI_KEY),
    CONTACT_EMAIL: present(process.env.CONTACT_EMAIL),
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    SERPAPI_ENGINE: process.env.SERPAPI_ENGINE || 'google'
  }});
});
export default router;
