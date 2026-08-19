# Create Pull Request

Analyze all changes in the current branch compared to the base branch, then automatically generate and raise a pull request with a clear, meaningful title and a description written for someone non-technical, like a product manager or a business stakeholder, who needs to understand what changed and why, not how it was implemented.

## Steps

1. Check the current branch.
2. If the current branch is `main`:
   - Run `git pull origin main` to ensure it is up to date.
   - Create a new feature branch from `main`.
   - Switch to the new branch before making any PR-related actions.
3. Identify the base branch (usually `main`).
4. Run `git log` and `git diff` to understand all changes in this branch.
5. Understand the purpose and intent behind the changes.
6. Generate a PR title and description following the rules below.
7. Run code formatting checks before pushing:
   ```bash
   npm run prettier
   ```
8. Run all tests before pushing:
   ```bash
   npm test
   ```
9. Push the branch if not already on remote using:
   ```bash
   git push -u origin HEAD
   ```
10. Create the PR using:
    ```bash
    gh pr create --title "<generated title>" --body "<generated description>" --base <base-branch>
    ```

## Branch Rules

- Never create a pull request directly from `main`.
- If currently on `main`, always:
  1. Pull the latest changes.
  2. Create a new branch.
  3. Switch to that branch.
  4. Continue the PR workflow from there.

- If already on a non-main branch, continue normally.

## PR Title Rules

- Must be short, clear, and describe what this PR does in plain English.
- Use sentence case (capitalize first word only).
- No technical jargon, no file names, no module names.
- Maximum 60 characters.

Examples:

- ✅ Add new team members to the about page
- ✅ Fix broken mobile navigation on blog articles
- ✅ Improve accessibility of contact form
- ❌ Update main.js and fix bug in swiper-sliders.js
- ❌ feat(css): fix tailwind z-index issue on header

## PR Description Rules

- Written as if explaining to a non-technical person (product manager, stakeholder, or business owner).
- Focus on what changed and why it matters.
- Never mention files, functions, classes, services, databases, or implementation details.
- Use plain, friendly English with short paragraphs.
- Avoid words like: component, module, function, API, endpoint, schema, migration, refactor, codebase, payload, props, state.

## PR Description Format

### What changed

- Keep the description short, simple, and easy to scan.
- Use bullet points, not paragraphs.
- Write for a product manager, reviewer, or business stakeholder.
  Focus on what changed and why it matters.
  Never mention implementation details, file names, classes, methods, databases, APIs, migrations, or technical architecture.
  Each bullet should be one short sentence.
  Avoid unnecessary words and repetition.
  Keep the entire description under bullet points.
