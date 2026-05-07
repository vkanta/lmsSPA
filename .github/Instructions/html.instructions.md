# HTML Best Practices

Based on Google HTML/CSS Style Guide and MDN Web Docs.

## Document Structure

- Use `<!doctype html>` to enable standards mode
- Specify `<meta charset="utf-8">` as the first element in `<head>`
- Use `<meta name="viewport" content="width=device-width, initial-scale=1.0">` for responsive design
- Include a meaningful `<title>` element

## Semantics

- Use elements for their intended purpose: headings for headings, `<p>` for paragraphs, `<a>` for links
- Use semantic elements: `<header>`, `<main>`, `<aside>`, `<footer>`, `<nav>`, `<article>`, `<section>`
- Use ARIA attributes where native semantics are insufficient

## Accessibility

- Provide `alt` text for all images (use `alt=""` for decorative images)
- Ensure all interactive elements are keyboard accessible
- Use proper heading hierarchy (`<h1>` through `<h6>`)
- Provide sufficient color contrast ratios
- Use `label` elements associated with form controls

## Separation of Concerns

- Keep structure (HTML), presentation (CSS), and behavior (JS) separate
- No inline styles or inline event handlers (`onclick`, `onchange`, etc.)
- Link stylesheets and scripts externally

## Attributes

- Use double quotation marks for attribute values
- Omit `type` attributes for `<script>` and `<link rel="stylesheet">`
- Avoid unnecessary `id` attributes; prefer `class` for styling
- If `id` is required, include a hyphen to avoid global `window` pollution

## Entity References

- Do not use entity references (e.g., `&mdash;`) — use UTF-8 characters directly
- Exception: `<`, `>`, `&`, and control characters

## Optional Tags

- Consider omitting optional closing tags for file size optimization
- Never omit `<html>`, `<head>`, or required tags

## Security

- Use HTTPS for all embedded resources
- Use `integrity` attributes for third-party scripts (SRI)
- Avoid `eval()` and inline event handlers
- Sanitize user-generated content before rendering with `innerHTML`
