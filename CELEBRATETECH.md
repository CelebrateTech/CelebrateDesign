# CelebrateDesign Guide

## Build & Test Commands

```sh
dotnet build         # Build .NET Project
npm run lint         # Run ESLint
<!-- npm test             # Run all tests -->
<!-- npx jest path/to/file.test.ts  # Run specific test file -->
<!-- npx jest -t "test name"        # Run tests matching pattern -->
```

## Code Style Guidelines

- **Naming**: PascalCase for classes/types, camelCase for functions/variables
- **Files**: PascalCase, test files with `.test.js` suffix
- **Imports**: ES module style, include `.js` extension, group imports logically
- **Formatting**: 4-space indentation, semicolons required, single quotes preferred
- **Testing**: Co-locate tests with source files, use descriptive test names
- **Comments**: JSDoc for public APIs, inline comments for complex logic

## Project Structure

- `/wwwroot/` — Static assets (CSS, JavaScript).
- `/Controllers/` — MVC controllers.
- `/Views/` — Razor views and partials.
- Tests alongside source files with `.test.ts` suffix
- Node.js >= 18 required
- .Net >= 8 required
