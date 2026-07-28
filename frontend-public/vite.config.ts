import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';

export default defineConfig({
  plugins: [reactRouter()],
  build: {
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/sitemap.xml': {
        target: 'http://localhost:8080',
        configure(proxy) {
          proxy.on('proxyReq', (proxyRequest, request) => {
            if (request.headers.host) {
              proxyRequest.setHeader('X-Forwarded-Host', request.headers.host);
            }
            proxyRequest.setHeader('X-Forwarded-Proto', 'http');
          });
        },
      },
      '/robots.txt': {
        target: 'http://localhost:8080',
        configure(proxy) {
          proxy.on('proxyReq', (proxyRequest, request) => {
            if (request.headers.host) {
              proxyRequest.setHeader('X-Forwarded-Host', request.headers.host);
            }
            proxyRequest.setHeader('X-Forwarded-Proto', 'http');
          });
        },
      },
    },
  },
});
