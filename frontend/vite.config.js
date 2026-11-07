import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 로컬 개발(npm run dev) 시 백엔드로 프록시
    proxy: { '/api': 'http://localhost:8000' },
  },
})
