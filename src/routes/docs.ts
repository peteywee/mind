// src/routes/docs.ts
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';

const router = Router();
const oasPath = resolve(process.cwd(), 'openapi-data-gpt.yaml');

let swaggerDocObj: any | null = null;
try {
  const raw = readFileSync(oasPath, 'utf8');
  swaggerDocObj = yaml.load(raw);
} catch {
  swaggerDocObj = null;
}

if (swaggerDocObj) {
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocObj));
  router.get('/openapi.yaml', (_req, res) =>
    res.type('text/yaml').send(readFileSync(oasPath, 'utf8'))
  );
} else {
  router.get('/docs', (_req, res) =>
    res.status(404).send('OpenAPI file not found.')
  );
}

export default router;
