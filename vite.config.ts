import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',

      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          usePolling: true,
        },
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
          name: 'html-transform',
          transformIndexHtml(html) {
            const seoPath = path.resolve(__dirname, 'src/config/seo.json');
            let seo: any = {};
            if (fs.existsSync(seoPath)) {
              seo = JSON.parse(fs.readFileSync(seoPath, 'utf-8'));
            }
            return html
              .replace(/<%= title %>/g, seo.title || '')
              .replace(/<%= description %>/g, seo.description || '')
              .replace(/<%= keywords %>/g, seo.keywords || '')
              .replace(/<%= author %>/g, seo.author || '')
              .replace(/<%= themeColor %>/g, seo.themeColor || '')
              .replace(/<%= locale %>/g, seo.locale || '')
              .replace(/<%= siteName %>/g, seo.siteName || '')
              .replace(/<%= url.canonical %>/g, seo.urls?.canonical || '')
              .replace(/<%= url.favicon %>/g, seo.urls?.favicon || '')
              .replace(/<%= url.ogImage %>/g, seo.urls?.ogImage || '');
          }
        },
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

              if (req.url?.startsWith('/api/settings/payment') && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    const newMethods = JSON.parse(body);
                    const payPath = path.resolve(__dirname, 'src/config/payment.json');
                    let payData = JSON.parse(fs.readFileSync(payPath, 'utf-8'));
                    payData.methods = newMethods;
                    fs.writeFileSync(payPath, JSON.stringify(payData, null, 2));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                  } catch (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  }
                });
                return;
              }

              if (req.url?.startsWith('/api/settings/app') && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    const payload = JSON.parse(body);
                    const appPath = path.resolve(__dirname, 'src/config/app.json');
                    let appData = JSON.parse(fs.readFileSync(appPath, 'utf-8'));
                    if (payload.supportPhone !== undefined) {
                       appData.app.supportPhone = payload.supportPhone;
                    }
                    if (payload.price !== undefined) {
                       appData.app.price = payload.price;
                    }
                    fs.writeFileSync(appPath, JSON.stringify(appData, null, 2));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                  } catch (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  }
                });
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