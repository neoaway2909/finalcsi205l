import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',   // ← บังคับให้ใช้ JSX runtime ใหม่
      babel: {
        plugins: ['styled-jsx/babel'],
      },
    }),
  ],
})

