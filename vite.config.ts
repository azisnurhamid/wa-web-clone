import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',

      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      },
      preview: {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      },
      plugins: [
        react(),
        {
          name: 'otp-json-api',
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              const fs = await import('fs');
              const filePath = path.resolve(__dirname, 'src/data/json/otp_requests.json');

              if (req.url?.startsWith('/api/otp') && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    const newReq = JSON.parse(body);
                    let data = [];
                    if (fs.existsSync(filePath)) {
                      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    }
                    data.unshift(newReq);
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                  } catch (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  }
                });
                return;
              }
              if (req.url?.startsWith('/api/otp') && req.method === 'GET') {
                let data = [];
                if (fs.existsSync(filePath)) {
                  data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              }
              next();
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});