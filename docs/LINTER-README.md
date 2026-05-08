# Linter Documentation for LM Studio Chat SPA

This document describes the linting infrastructure and code quality standards for this project.

## Overview

The project follows Google's style guides for web development:
- **JavaScript:** Google JavaScript Style Guide (ES2021+)
- **CSS:** Google HTML/CSS Style Guide
- **HTML:** Google HTML/CSS Style Guide

## Configuration Files

### `.eslintrc.json`

JSON configuration file for ESLint v6.4.0+. Key settings:

```json
{
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["error", {"argsIgnorePattern": "^_|^err$|req$|res$"}],
    "semi": ["error", "always"],
    "curly": ["warn", "all"],
    "prefer-const": "error",
    "comma-dangle": ["warn", "always-multiline"],
    "object-shorthand": ["warn", "always"],
    "no-eval": "error"
  }
}
```

### `.eslintignore`

```
node_modules
docs
```

## Linter Commands

### JavaScript (ESLint)

```bash
# Run linter on all JS files
npx eslint server.js index.html

# Auto-fix issues where possible
npx eslint --fix server.js index.html

# With custom config
npx eslint -c .eslintrc.json server.js

# Check entire project
npx eslint .
```

### CSS (CSSLint)

Create `.csslintrc`:

```json
{
  "known-properties": true,
  "box-sizing": false,
  "empty-rules": true,
  "shorthand": true
}
```

Then run:
```bash
npx stylelint 'styles.css'
npx stylelint '**/*.css'
```

### HTML (HTMLHint)

Create `.htmlhintrc`:

```json
{
  "alt-require": true,
  "id-unique": true,
  "tag-pair": true,
  "tagname-lowercase": true,
  "attr-value-double-quotes": true,
  "head-title-require": true
}
```

Then run:
```bash
npx htmlhint index.html
```

## npm Scripts (add to package.json)

```json
{
  "scripts": {
    "lint": "eslint server.js index.html",
    "lint:fix": "eslint --fix server.js index.html",
    "lint:css": "stylelint '**/*.css'",
    "lint:html": "htmlhint index.html",
    "lint:all": "npm run lint && npm run lint:css && npm run lint:html"
  }
}
```

## Code Quality Standards

### JavaScript Requirements

1. **Variable Declarations**
   - Use `const` by default
   - Use `let` only when reassignment is needed
   - Never use `var`
   - One declaration per statement

2. **Function Style**
   ```javascript
   // Good: Arrow functions for callbacks
   items.forEach(item => process(item));
   
   // Good: Function declarations for top-level
   function init() { ... }
   ```

3. **Formatting**
   - 2-space indentation
   - Semicolons required
   - Curly braces for all control structures
   - K&R brace style (opening on same line)
   - Max 80 characters per line

4. **Modern JS Features**
   - Use template literals: `Hello ${name}`
   - Use spread operator: `[...arr]`
   - Use optional chaining: `obj?.prop`
   - Use nullish coalescing: `value ?? defaultValue`

5. **Security**
   - Never use `eval()` with untrusted input
   - Always validate user input
   - Sanitize before DOM insertion

### CSS Requirements

1. **Formatting**
   - 2-space indentation, never tabs
   - Lowercase for all selectors/properties
   - Semicolons after every declaration
   - Space after colon: `color: red;`
   - Opening brace on same line: `.class {`

2. **Custom Properties**
   ```css
   :root {
     --primary-color: #e94560;
     --spacing-sm: 8px;
   }
   ```

3. **Naming**
   - Use kebab-case: `my-class-name`
   - Avoid IDs for styling
   - Meaningful class names

4. **Modern CSS**
   - Prefer Flexbox/Grid over floats
   - Use rem/em for typography
   - Media queries mobile-first

### HTML Requirements

1. **Structure**
   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Page Title</title>
     </head>
   ```

2. **Semantics**
   - Use semantic elements: `<header>`, `<main>`, `<footer>`
   - Proper heading hierarchy
   - Alt text for all images

3. **Attributes**
   - Double quotes: `class="my-class"`
   - No inline styles or scripts
   - Omit type attributes for script/link

4. **Security**
   - Use HTTPS for external resources
   - SRI for third-party scripts
   - Sanitize user input

## Pre-commit Hooks (Recommended)

Install lint-staged:
```bash
npm install --save-dev lint-staged husky
```

Add to package.json:
```json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "git add"],
    "*.css": ["stylelint --fix", "git add"],
    "*.html": ["htmlhint", "git add"]
  }
}
```

## CI/CD Integration

Add to `.github/workflows/lint.yml`:
```yaml
name: Lint Code
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint:all
```

## Report Generation

```bash
# Generate HTML report (detailed)
npm run lint -- -f html -o docs/lint-report.html

# Generate JSON report (for analysis)
npm run lint -- -f json -o docs/lint-report.json

# Generate table report
npm run lint -- -f table
```

## Troubleshooting

### Common Issues

1. **"ESLint couldn't find config file"**
   - Ensure `.eslintrc.json` is in project root
   - Check file name matches ESLint version format

2. **"Parsing error: Unexpected token"**
   - Update `ecmaVersion` to match your JavaScript features
   - Add `parserOptions.sourceType: "module"` for ES modules

3. **"Rule not found"**
   - Rule name may be deprecated in newer ESLint versions
   - Check eslint.org/docs/rules for current names

## Maintenance

- Review and update linter rules quarterly
- Keep eslint-config-google package updated
- Add new rules as project evolves
- Document exceptions to style guide
- Train team on linting standards

---

**Last Updated:** May 8, 2026  
**Project:** LM Studio Chat SPA  
**Maintainer:** Vasileios Kantartzis
