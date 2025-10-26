import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/*.ts", "src/lib/*.tsx"],
      exclude: [
        "node_modules/",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/index.ts",
        "src/lib/utils.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
