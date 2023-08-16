module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:compat/recommended",
    "plugin:svelte/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    extraFileExtensions: [".svelte"],
  },
  plugins: [
    "import",
    "simple-import-sort",
    "node",
    "@typescript-eslint",
    "@typescript-eslint/eslint-plugin",
  ],
  rules: {
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "import/newline-after-import": "warn",
    "import/extensions": ["error", "ignorePackages"],
    "import/no-useless-path-segments": "warn",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "prefer-const": "warn",
    "no-nested-ternary": "warn",
    "@typescript-eslint/consistent-type-imports": "error",
    "node/file-extension-in-import": [
      "error",
      "always",
      {
        tryExtensions: [".ts"],
      },
    ],
  },
  overrides: [
    {
      files: "**/*.ts",
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
      ],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
      rules: {
        "svelte/no-at-html-tags": "off",
        "svelte/valid-compile": ["error", { ignoreWarnings: true }],
      },
    },
  ],
  env: { browser: true },
  ignorePatterns: ["backend_proto.d.ts", "*.svelte.d.ts", "vendor", "extra/*"],
  globals: {
    globalThis: false,
    NodeListOf: false,
    $$Generic: "readonly",
  },
};
