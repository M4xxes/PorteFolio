import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Three Fiber drives WebGL scenes imperatively: useFrame mutates refs/materials
    // every frame outside React's render cycle. The React Compiler lint rules (purity,
    // immutability, refs) assume a DOM-only render model and don't recognize that pattern,
    // so they misfire here — same tension the wider r3f ecosystem currently has with them.
    files: ["src/components/3d/**", "src/shaders/**"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
