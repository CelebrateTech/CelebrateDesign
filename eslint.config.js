// @ts-check
import eslint from "@eslint/js";

export default [
    // Global ignores - ignore everything except our target directory
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/*.min.js",
            // Ignore everything at root level except wwwroot
            "/*.js",
            "/*.json",
            "/*.md",
            "/*.txt",
            "/*.yml",
            "/*.yaml",
            // Ignore everything in wwwroot except CTScriptFr
            "wwwroot/*",
            "!wwwroot/CTScriptFr/"
        ]
    },
    eslint.configs.recommended,  // ESLint recommended rules
    {
        files: ["wwwroot/CTScriptFr/*.js"], // Only lint these files
        rules: {
            // Force camelCase for variables & functions
            "camelcase": ["error", { properties: "always" }],
            // Force PascalCase for classes
            "new-cap": ["error", { newIsCap: true, capIsNew: false }],
            // Disallow unused vars (but allow _prefix)
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            // Disallow console.log in production
            "no-console": "error",
        },
    }
];