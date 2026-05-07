# CSS Best Practices

Based on Google HTML/CSS Style Guide and MDN Web Docs.

## General Formatting

- Indent by 2 spaces, never use tabs
- Use lowercase for all selectors, properties, and values (except strings)
- Remove trailing whitespace
- Use semicolons after every declaration
- Use a space after the colon in property declarations: `font-weight: bold;`
- Place opening brace on same line as selector with a space before: `.class {`
- Separate rules by blank lines
- One selector per line, one declaration per line

## CSS Custom Properties

- Use CSS custom properties (variables) for reusable values: colors, spacing, fonts
- Define in `:root` for global scope
- Use descriptive names with kebab-case

## Naming Conventions

- Use meaningful or generic class names reflecting purpose, not presentation
- Class names should be as short as possible but as long as necessary
- Separate words in class names with hyphens (kebab-case)
- Avoid ID selectors; use class selectors instead
- Avoid qualifying class names with type selectors (e.g., `div.error`)

## Properties

- Use shorthand properties where possible (`padding: 0 1em 2em;`)
- Omit units after `0` values (except when required, e.g., `flex`)
- Always include leading `0` for decimal values (`0.8em`)
- Use 3-character hex notation where possible (`#fff` instead of `#ffffff`)
- Avoid `!important`; use selector specificity instead

## Organization

- Group related properties together
- Alphabetize declarations within rules (optional but recommended)
- Use section comments for grouping: `/* Header */`

## Modern CSS

- Use Flexbox and Grid for layouts instead of floats
- Use `rem` and `em` for scalable typography
- Use `clamp()` for responsive sizing
- Use media queries for responsive design with mobile-first approach
- Use `:where()` and `:is()` for specificity control

## Performance

- Minimize use of universal selector `*`
- Avoid deep nesting of selectors
- Use `will-change` sparingly for animation optimization
- Prefer `transform` and `opacity` for animations (GPU accelerated)
