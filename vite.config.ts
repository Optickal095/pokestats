import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // ECharts is most of the bundle and changes rarely: its own file stays cached between releases.
        advancedChunks: { groups: [{ name: 'echarts', test: /node_modules[\\/](echarts|zrender)[\\/]/ }] },
      },
    },
  },
})
