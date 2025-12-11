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
  // Custom rule overrides
  {
    rules: {
      // Disable unescaped entities rule - apostrophes in text are fine
      "react/no-unescaped-entities": "off",
      // Warn on unused vars instead of error
      "@typescript-eslint/no-unused-vars": "warn",
      // Warn on explicit any instead of error (we have necessary uses)
      "@typescript-eslint/no-explicit-any": "warn",
      // Warn on React compiler rules (experimental, can be noisy)
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]);

export default eslintConfig;
