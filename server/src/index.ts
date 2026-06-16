import { app } from './app';
import { env } from './env';

app.listen(env.port, () => {
  console.log(`[api] Orange Blossom API listening on http://localhost:${env.port}`);
});
