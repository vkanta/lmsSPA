# JavaScript Best Practices

Based on Google JavaScript Style Guide and MDN Web Docs.

## Variables and Declarations

- Use `const` by default, `let` when reassignment is needed
- Never use `var`
- Declare one variable per statement
- Declare variables close to where they are first used
- Initialize variables as soon as possible

## Functions

- Prefer arrow functions for callbacks and short expressions
- Use function declarations for top-level named functions
- Use default parameters instead of checking for `undefined`
- Use destructuring for function parameters when appropriate
- Keep functions small and focused on a single responsibility

## Formatting

- Use 2-space indentation
- Use semicolons to terminate statements
- Use curly braces for all control structures
- Opening brace on same line as statement (K&R style)
- 80-column line limit; wrap at higher syntactic levels
- Use trailing commas in multi-line arrays and objects
- Use template literals instead of string concatenation

## Modern JavaScript

- Use optional chaining (`?.`) for safe property access
- Use nullish coalescing (`??`) for default values
- Use spread operator for array/object copying and merging
- Use `for...of` for iterating arrays
- Use `Map`/`Set` instead of plain objects for key-value stores when keys are dynamic
- Use `Promise` and `async/await` over callbacks

## Error Handling

- Use `try/catch` for operations that may fail
- Don't swallow errors; log or rethrow
- Use specific error types where appropriate
- Validate inputs at function boundaries

## DOM Manipulation

- Cache DOM references to avoid repeated queries
- Use `classList` instead of manipulating `className` strings
- Use `textContent` instead of `innerHTML` when not rendering HTML
- Use event delegation for dynamic elements
- Batch DOM reads and writes to avoid layout thrashing
- Use `requestAnimationFrame` for visual updates

## Security

- Never use `eval()` or `new Function()` with untrusted input
- Sanitize user input before DOM insertion
- Use `textContent` over `innerHTML` for user data
- Validate and sanitize URLs before use
- Use CSP headers on the server side

## Performance

- Debounce/throttle event handlers for scroll, resize, input
- Use `DocumentFragment` for batch DOM insertions
- Lazy-load resources that aren't immediately needed
- Minimize global scope pollution
- Use `localStorage` quota wisely (avoid storing large objects)
