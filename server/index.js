import { app } from './app.js';
import { config } from './config.js';

const port = config.PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
});
