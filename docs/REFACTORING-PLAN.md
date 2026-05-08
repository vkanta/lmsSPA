# Code Refactoring Plan - LM Studio Chat SPA

## File Size Analysis

| Current File | Lines | Status |
|-------------|-------|--------|
| index.html | 1302 | ❌ Too large (monolithic) |
| styles.css | 785 | ✅ Acceptable |
| server.js | 857 | ⚠️ Could be smaller |

## Refactoring Strategy

### Priority: Split index.html into modular components

**Current issue:** 1302-line HTML file with embedded CSS and JavaScript
**Target:** ~400 lines max per file

### Proposed Structure:

```
index.html          # Main HTML structure (~150 lines)
├── assets/
│   ├── styles/     # External CSS
│   │   └── main.css    (785 → 600 lines, extract utilities)
│   └── js/         # Modular JavaScript
│       ├── utils.js        (~200 lines - markdown, state, etc.)
│       ├── ui.js           (~300 lines - DOM manipulation, events)
│       └── api.js          (~150 lines - API calls, streaming)
```

### Refactoring Steps:

1. **Extract CSS** from index.html inline styles
   - Move all `<style>` block to `styles/main.css`
   - Keep only essential CSS for initial render

2. **Extract JavaScript** into modules:
   - `utils.js`: Markdown renderer, helpers, state management
   - `ui.js`: Event listeners, UI updates, DOM manipulation
   - `api.js`: Fetch calls, streaming, tool handling

3. **Split index.html**:
   - HTML structure only (~150 lines)
   - Minimal inline CSS for critical path
   - Script tags referencing external modules

### Benefits:

- ✅ Better maintainability (smaller files = easier navigation)
- ✅ Improved code organization
- ✅ Easier testing and debugging
- ✅ Better team collaboration
- ✅ Follows single responsibility principle

---

**Note:** This assumes a target of 200-400 lines per file for optimal readability.
