import express, { NextFunction, Request, Response } from 'express';
import { router } from './routes';

const app = express();
app.use(express.json());
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));
app.use('/v1', router);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ detail: err.message ?? 'internal error' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Node orchestrator listening on ${port}`);
});
