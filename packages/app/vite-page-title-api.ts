import { GET as getPageTitle } from '../api/page-title';
import type { Plugin } from 'vite';

/** Serves `/api/page-title` during Vite dev (Vercel serverless is not available on localhost). */
export function pageTitleApiPlugin(): Plugin {
  return {
    name: 'peacock-page-title-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? '';
        if (path !== '/api/page-title') {
          next();
          return;
        }

        const host = req.headers.host ?? 'localhost';
        const request = new Request(`http://${host}${req.url ?? '/api/page-title'}`, {
          method: req.method,
        });

        void getPageTitle(request)
          .then(async (response) => {
            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });
            res.end(Buffer.from(await response.arrayBuffer()));
          })
          .catch(next);
      });
    },
  };
}
