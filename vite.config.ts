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