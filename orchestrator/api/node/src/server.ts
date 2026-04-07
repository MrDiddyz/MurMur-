import express from 'express';
import { router } from './routes.js';

const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/v1', router);

const port = Number(process.env.PORT ?? 8081);
app.listen(port, () => {
  console.log(`Node orchestrator API listening on :${port}`);
});
