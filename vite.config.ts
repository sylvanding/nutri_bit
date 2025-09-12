import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 8892,
    // for remote development
    // hmr: {
    //   host: '192.168.1.3', // WSL 的 IP 地址
    // },
    // // 解决 WSL2 文件系统监听问题
    // watch: {
    //   usePolling: true,
    // }
  }
});
