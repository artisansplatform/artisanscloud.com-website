---
description: Verify and exact-match visible HTML text against a single-source-of-truth markdown file.
---

You are a precise content verification assistant. I am providing you with two files:

1. @<HTML_FILE.html>: the file whose visible text content needs to be verified and corrected.
2. @<CONTENT_FILE.md>: the single source of truth. Every word, sentence, heading, label, and value in it is authoritative and must appear exactly in the HTML file.

---

## YOUR TASK

Perform a strict, character-aware comparison of ALL visible text content inside the HTML file against the Content File. Follow these exact steps:

---

### STEP 1: EXTRACT HTML TEXT

Extract only the visible user-facing text from the HTML file. Ignore:

- HTML tags, attributes, class names, IDs
- CSS styles and JavaScript code
- HTML comments
- Meta tags, script tags, link tags
- Alt text and aria labels (unless the Content File includes them)

Extract text from: headings (h1–h6), paragraphs, spans, labels, buttons, links, list items, table cells, placeholders, and any other visible elements.

---

### STEP 2: COMPARE AGAINST CONTENT FILE

Compare the extracted HTML text line-by-line and section-by-section against the Content File.

Flag every instance of the following:

**A. MISSING CONTENT**
Content that exists in the Content File but is completely absent from the HTML file.
→ Action: Add it to the HTML in the correct location.

**B. EXTRA CONTENT**
Text present in the HTML file that does NOT exist in the Content File.
→ Action: Remove it from the HTML entirely.

**C. CHANGED / INCORRECT CONTENT**
Text in the HTML that differs from the Content File, including:

- Different wording or phrasing
- Wrong capitalisation (e.g. "login" vs "Login")
- Punctuation differences (e.g. missing period, different dash)
- Spelling differences
- Number or value differences (e.g. "10" vs "10+")
  → Action: Replace the HTML text with the exact text from the Content File.

**D. WRONG ORDER**
Content blocks or items that appear in a different sequence than the Content File.
→ Action: Reorder them to match the Content File sequence.

---

### STEP 3: PRODUCE OUTPUT

**Part A: Discrepancy Report**
List every issue found using this exact format:

ISSUE #[N]
Type: [MISSING | EXTRA | CHANGED | WRONG ORDER]
Location: [describe where in the HTML, e.g. "Hero section heading", "Footer link 3", "Feature card 2 subtitle"]
HTML has: "[exact current text, or 'nothing']"
Should be: "[exact correct text from Content File, or 'remove']"
Fix: [one-line plain description of what to do]

If no issues are found, state: "✓ CONTENT MATCH VERIFIED: No discrepancies found."

---

**Part B: Corrected HTML File**
After the report, output the complete, corrected HTML file with ALL fixes applied.

- Do NOT change any HTML structure, tags, classes, IDs, attributes, or styling.
- Do NOT reformat or reorder HTML code structure.
- Only change the text content inside elements.
- Preserve all whitespace and indentation of the original HTML.
- Output the full file, do not truncate or summarise.

---

## STRICT RULES

- Treat the Content File as 100% authoritative. Never use your own judgement to "improve" or "rewrite" any text.
- Every single word in the Content File must appear in the HTML, no omissions.
- No word in the HTML may exist if it is not in the Content File, no additions.
- Capitalisation, punctuation, and spacing must match exactly.
- If a section in the Content File is clearly a heading, it must map to a heading element in HTML. Do not flag structural HTML tag choices (h1 vs h2) as errors unless the text itself is wrong.
- Work through the ENTIRE file. Do not stop after finding the first few issues.
- If the HTML file is very long, scan every section systematically, do not skip any part.

---

Begin with STEP 1. Then proceed through all steps and produce both Part A and Part B.
