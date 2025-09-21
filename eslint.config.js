import securityPlugin from "eslint-plugin-security";

export default [
  // Backend microservices
  {
    files: ["services/**/*.js", "services/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Node.js globals
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    plugins: {
      security: securityPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-eval": "error",
      "eqeqeq": "error",
      "no-console": "warn",
      ...securityPlugin.configs.recommended.rules,
    },
  },

  // Frontend React project
  {
    files: ["web-client/**/*.js", "web-client/**/*.jsx", "web-client/**/*.ts", "web-client/**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
      },
    },
    plugins: {
      security: securityPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-eval": "error",
      "eqeqeq": "error",
      "no-console": "warn",
      ...securityPlugin.configs.recommended.rules,
    },
  },
];
