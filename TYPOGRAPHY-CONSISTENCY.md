# Typography Consistency: Approach A Implementation Plan

> Status: plan only. No code has been changed yet. This document is the full,
> step-by-step plan to make font size / weight / line-height consistent across all
> pages using **semantic typography component classes** (Approach A).

## 1. Goal

Today every page hand-writes long Tailwind text-utility strings for the same roles
(page title, section title, card title, body), so the same element drifts in size,
weight, and line-height from page to page. There are also scattered magic numbers
like `text-[50px]`, `text-[44px]`, `text-[42px]`, `text-[38px]`, `text-[28px]`,
`text-[22px]`.

The fix: define the type scale **once** as a small set of semantic classes
(`.t-display`, `.t-h2`, `.t-body`, ...) in `assets/style/input.css`. Pages then
reference a role, not a pixel value. Changing the scale globally becomes a one-line
edit.

## 2. Hard Rules for This Plan

1. **No magic numbers.** No arbitrary `text-[NNpx]` and no arbitrary
   `leading-[NN%]` anywhere, not even inside the new classes. Sizes use Tailwind's
   standard scale steps (`text-sm` ... `text-6xl`); line-heights use **named
   tokens** defined once in `@theme`.
2. **One class owns one role.** Each `.t-*` class owns only size + weight +
   line-height. Color (`text-heading`, `text-white`, ...) and spacing (`mb-*`)
   stay as separate utilities on the element.
3. **`font-primary` is dropped from markup.** `body` already sets Poppins, so the
   2,888 repeated `font-primary` classes are redundant and get removed during
   migration.
4. **Incremental and visually safe.** Roll out page-by-page; each step is
   verifiable at 393 / 768 / 1280px before moving on.

## 3. Tailwind Standard Scale Reference (no custom px needed)

Every size the site needs maps onto Tailwind's built-in steps, so we never write a
pixel value in markup:

| Step | Size | Step | Size |
|------|-----:|------|-----:|
| `text-xs`  | 12px | `text-3xl` | 30px |
| `text-sm`  | 14px | `text-4xl` | 36px |
| `text-base`| 16px | `text-5xl` | 48px |
| `text-lg`  | 18px | `text-6xl` | 60px |
| `text-xl`  | 20px | | |
| `text-2xl` | 24px | | |

The current off-scale values get normalized to the nearest standard step:
`text-[50px]/[44px] -> text-5xl`, `text-[42px]/[38px]/[36px] -> text-4xl`,
`text-[28px] -> text-2xl/text-3xl`, `text-[22px] -> text-xl`,
`text-[clamp(14px,1.3vw,18px)] -> text-base`. No design token is lost; everything
lands on a named step.

## 4. Step 1 - Add named line-height tokens (`@theme`)

Add two named line-height tokens to the existing `@theme` block in
`assets/style/input.css`. These replace every `leading-[120%]` / `leading-[150%]`
/ `leading-[125%]` / `leading-[130%]` etc. with a named utility.

```css
@theme {
  /* ...existing color and font tokens stay... */

  --leading-heading: 1.2;   /* all headings -> use leading-heading */
  --leading-body: 1.5;      /* all body copy -> use leading-body */
}
```

This generates `leading-heading` and `leading-body` utilities. No arbitrary
`leading-[..]` values remain.

## 5. Step 2 - Add the typography classes (`@layer components`)

Add to the existing `@layer components` block in `assets/style/input.css`. These
are the only place the scale is defined.

```css
@layer components {
  /* ---- Typography scale (single source of truth) ---- */

  /* Headings */
  .t-display { @apply font-semibold leading-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl; } /* page / hero h1 */
  .t-h2      { @apply font-semibold leading-heading text-3xl md:text-4xl lg:text-5xl; }             /* section title h2 */
  .t-h2-sm   { @apply font-semibold leading-heading text-2xl lg:text-3xl; }                         /* compact section title */
  .t-h3      { @apply font-semibold leading-heading text-xl lg:text-2xl; }                          /* card / sub heading */

  /* Body */
  .t-lead    { @apply font-normal leading-body text-lg lg:text-xl; }   /* lead / intro paragraph */
  .t-body    { @apply font-normal leading-body text-base; }            /* default paragraph */
  .t-body-sm { @apply font-normal leading-body text-sm; }              /* small / secondary */
  .t-caption { @apply font-normal leading-body text-xs; }              /* captions / labels */
}
```

After this step, `npm run build` produces identical output to today, because no
markup uses the classes yet. This is a safe, zero-visual-change commit.

## 6. Role -> Class Mapping (what each old pattern becomes)

| Element / role | Today (examples) | Becomes |
|---|---|---|
| Hero / page `h1` | `text-[clamp(24px,3.6vw,42px)]` or `text-2xl sm:text-4xl lg:text-[44px] xl:text-[50px]` + `font-semibold` + `leading-[120%]` + `font-primary` | `t-display` |
| Section title `h2` | `lg:text-5xl md:text-4xl text-3xl font-semibold leading-[120%] font-primary` (+ 46 variants) | `t-h2` |
| Compact `h2` | `text-2xl lg:text-3xl font-semibold leading-[125%]` | `t-h2-sm` |
| Dark-section `h2` | `xl:text-[42px] lg:text-4xl text-3xl font-semibold leading-[120%] text-white` | `t-h2 text-white` |
| Card title `h3` | `text-xl lg:text-2xl font-semibold leading-[120%]` / `lg:text-[28px] text-2xl ...` | `t-h3` |
| Lead paragraph | `text-[22px]` / `text-lg` / `text-[clamp(14px,1.3vw,18px)]` + `leading-[150%]` | `t-lead` |
| Default paragraph | no size (inherits 16px) / `text-base` + `leading-[150%]` + `font-primary` | `t-body` |
| Small paragraph | `text-sm ... leading-[150%]` | `t-body-sm` |
| Caption / label | `text-xs` / `text-[12px]` / `text-[13px]` | `t-caption` |

Notes:
- Weight is normalized: section/card headings standardize on `font-semibold`. The
  stray `font-extrabold` / `font-bold` headings that should match their siblings
  drop into the standard class. Any heading that is *intentionally* heavier keeps
  an explicit `font-extrabold` utility added after the `.t-*` class.
- Color and margin utilities are kept on the element unchanged (e.g.
  `class="mb-5 text-white t-h2"`).
- `font-primary` is removed everywhere during the swap.

Before / after example:

```html
<!-- before -->
<h2 class="mb-5 md:mb-[30px] lg:text-5xl md:text-4xl text-3xl text-heading font-primary font-semibold leading-[120%]">

<!-- after -->
<h2 class="mb-5 md:mb-[30px] text-heading t-h2">
```

## 7. Step 3 - Pilot on one page

1. Pick one representative feature page (suggest `enterprise-data-search.html`,
   recently edited and mid-size).
2. Replace its heading/body class strings per the mapping in section 6.
3. `npm run dev`, then eyeball at **393 / 768 / 1280px** (the PR-checklist
   breakpoints) against the current production page side by side.
4. If anything looks off, adjust the **class definitions** in `input.css` (not the
   markup) until the pilot matches. This is where the exact steps get locked.

## 8. Step 4 - Lock the scale

Once the pilot is signed off, the step values inside the `.t-*` classes are frozen
as the source of truth. From here, no page should change them locally.

## 9. Step 5 - Roll out page-by-page

Migrate the remaining pages in small PRs (a few pages each) so each diff stays
reviewable and each batch can be eyeballed.

Migration is mostly mechanical find/replace, since a handful of exact strings cover
most occurrences. Highest-value exact-match swaps:

| Find (exact class string) | Replace with |
|---|---|
| `lg:text-5xl md:text-4xl text-3xl text-heading font-primary font-semibold leading-[120%]` | `text-heading t-h2` |
| `mb-5 text-2xl lg:text-3xl text-heading font-primary font-semibold leading-[120%]` | `mb-5 text-heading t-h2-sm` |
| `mb-3 text-xl lg:text-2xl text-heading font-primary font-semibold leading-[120%]` | `mb-3 text-heading t-h3` |
| `text-description font-primary font-normal leading-[150%]` | `text-description t-body` |
| `text-base text-description font-normal font-primary` | `text-description t-body` |

Process per batch:
1. Apply the exact-match swaps with a script (e.g. a `sed`/Node pass over the
   batch's `*.html`).
2. Hand-fix the remaining one-off variants on those pages using the section 6
   mapping.
3. `npm run build` and `npm test` (the build + link/convention/SEO tests).
4. Spot-check the batch at the three breakpoints.
5. Commit the batch.

Suggested batching (≈40 pages total):
- Batch 1: home + top-level (`index.html`, `about-us.html`, `contact-us.html`,
  `request-demo.html`, `articles-and-resources.html`).
- Batches 2-5: feature / use-case pages grouped by similarity (the `text-2xl
  lg:text-3xl` H2 family vs the `lg:text-5xl ...` family) so each batch shares a
  find/replace set.
- Batch 6: policy / misc (`privacy-policy.html`, `terms-and-conditions.html`,
  `404.html`, `thank-you.html`, blog pages).
- Partials (`partials/header.html`, `partials/footer.html`) only if they carry
  heading/body roles; the footer mega-title (`ftrBottomTitle`) is intentionally
  bespoke and stays as-is.

## 10. Verification per batch

- `npm run build` succeeds.
- `npm test` passes (build, link validation, conventions, SEO, font-subset).
- No console errors on the affected pages.
- Visual match at 393 / 768 / 1280px against production.
- Confirm `font-primary` count drops as pages migrate
  (`grep -rho 'font-primary' --include="*.html" . | wc -l`).

## 11. Step 6 - Documentation (required by the project Documentation Rule)

- Add a **Typography scale** section to `docs/development.md` listing the `.t-*`
  classes, what each is for, and the rule "use a `.t-*` class for all
  headings/body; never hand-write `text-[NNpx]` or `leading-[NN%]`."
- Add a Gotcha bullet to `CLAUDE.md` and `AGENTS.md` (keep both in sync):
  "Typography is centralized. Use `.t-display` / `.t-h2` / `.t-h2-sm` / `.t-h3` /
  `.t-lead` / `.t-body` / `.t-body-sm` / `.t-caption`. Do not hard-code font sizes
  or line-heights, and do not add `font-primary` (the `body` already sets it)."
- Update the page-building skills' expectations so new pages emit `.t-*` classes
  instead of raw size strings.

## 12. Rollout Summary (sequence)

1. Add `--leading-heading` / `--leading-body` tokens to `@theme`. (no visual change)
2. Add the eight `.t-*` classes to `@layer components`. (no visual change)
3. Pilot one page, tune class definitions, sign off.
4. Lock the scale.
5. Migrate pages in small batches; build + test + eyeball each batch.
6. Update docs and the page skills.

## 13. Open Decisions to Confirm Before Step 3

1. **Hero `h1` top size.** Plan caps `t-display` at `text-6xl` (60px) on `xl`. Keep
   that, or cap at `text-5xl` (48px) to stay closer to today's 50px max?
2. **Lead size.** Plan sets `t-lead` to 18px -> 20px (`text-lg lg:text-xl`),
   normalizing today's `text-[22px]`. Confirm 20px max is acceptable (vs 22px).
3. **Class names.** `t-*` prefix vs a more descriptive scheme
   (`heading-section`, `text-body`, ...). Purely naming preference.
4. **Compact-vs-full H2.** Confirm which sections are "compact" (`t-h2-sm`, the
   `text-2xl lg:text-3xl` family) vs full (`t-h2`) so the mapping script targets
   the right ones.
