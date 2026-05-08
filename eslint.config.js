import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-unused-vars": ["error", { argsIgnorePattern: "^_|^err$|req$|res$" }],
      "semi": ["error", "always"],
      "curly": ["warn", "all"],
      "prefer-const": "error",
      "comma-dangle": ["warn", "always-multiline"],
      "object-shorthand": ["warn", "always"]
    }
  },
  {
    ignores: ["node_modules/**", "docs/**"]
  }
];
