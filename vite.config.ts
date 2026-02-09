import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Явно указываем базовый путь
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    assetsDir: 'assets', // Папка для статических ресурсов
    rollupOptions: {
      output: {
        // Гарантируем правильные пути к ресурсам
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  // Убеждаемся, что public файлы копируются
  publicDir: 'public',
})
