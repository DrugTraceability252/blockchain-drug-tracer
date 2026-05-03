import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import istanbul from "vite-plugin-istanbul";

export default defineConfig({
  plugins: [
    istanbul({
      include: "app/**/*",
      exclude: ["node_modules", "test/**", "tests/**"],
      extension: [".ts", ".tsx"],
      requireEnv: true,
      checkProd: false,
    }),
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths(),
  ],
  build: {
    sourcemap: true,
  }
});