import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      BookMappings: path.resolve(__dirname, 'src/assets/BookMappings.js')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (content, filename) => {
          if (filename.replace(/\\/g, '/').endsWith('/global.scss')) {
            return content;
          }
          return `@use "@/styles/global.scss" as *;\n${content}`;
        }
      }
    }
  }
})