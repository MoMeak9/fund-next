import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const ignoredPaths = [
  ".next/**",
  "node_modules/**",
  "coverage/**",
  "dist/**",
  "out/**",
  "next-env.d.ts",
  "tsconfig.tsbuildinfo",
];

const eslintConfig = [
  {
    ignores: ignoredPaths,
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
