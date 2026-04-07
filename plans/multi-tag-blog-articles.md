# Plan: Multi-tag System for Blog Articles

## Overview
Migrate blog article categorization from single `category` string to multiple `tags` array (up to 3 tags). Tags will be assigned based on title AND article content, not just title keywords.

## Tag Definitions

Three static tags:
- **AI** - keywords: `ai`, `artificial intelligence`, `machine learning`, `agentic`, `llm`, `deep learning`, `neural`, `generative`
- **Data** - keywords: `data analytics`, `data lake`, `data engineering`, `etl`, `data pipeline`, `data warehouse`, `analytics platform`, `business intelligence`
- **Retail** - keywords: `retail`, `store`, `omnichannel`, `merchandise`, `pos`, `point of sale`, `commerce`

## Changes Required

### 1. Backend: `api/lib/linkedin.js`

**Current behavior (lines 181-210):**
```javascript
function extractCategory(title) {
  // Returns single category based on title keywords
  // Returns 'Retail Insights' as default
}
```

**New behavior:**
- Replace `extractCategory(title)` with `extractTags(title, contentText)`
- Accept both title and plain-text article content
- Check both for keyword matches (case-insensitive)
- Return array of matching tags (up to 3)
- Default to `["Retail"]` if no matches
- Function signature: `extractTags(title, contentText) => string[]`
- Three tag definitions:
  - AI - keywords: ai, artificial intelligence, machine learning, agentic, llm, deep learning, neural, generative
  - Data - keywords: data analytics, data lake, data engineering, etl, data pipeline, data warehouse, analytics platform, business intelligence
  - Retail - keywords: retail, store, omnichannel, merchandise, pos, point of sale, commerce

**Usage (line 162):**
- Change: `category: extractCategory(article.title || '')`
- To: `tags: extractTags(article.title || '', strippedContentText)`
- Extract content at line 153 where `extractDescription()` is called; reuse that logic

### 2. Frontend: `assets/script/modules/blog-articles.js`

**Update `createBlogCardHTML()` (lines 38-69):**
- Change line 42: `const safeCategory = escapeHTML(article.category || 'Retail Insights');`
- To: `const safeTags = (article.tags || []).map(tag => escapeHTML(tag));`
- Update line 51-52 badge rendering to loop over tags:
  ```html
  ${safeTags.map(tag => `<div class="px-2.5 py-0.5 rounded-[50px] text-center w-fit h-fit bg-[#F5EEFE] text-[#9F7EFF] font-primary font-medium sm:text-base text-sm">${tag}</div>`).join('')}
  ```
- Add backward compatibility: if `article.tags` is undefined but `article.category` exists, use `[article.category]`
- Default fallback to `["Retail"]`

**Update `createInsightsCardHTML()` (lines 71-102):**
- Same changes as above for consistency

**No changes needed:**
- Load More button logic remains unchanged
- Article fetch/render pipeline unchanged

### 3. Data: `assets/data/fallback-articles.json`

**Replace `"category"` with `"tags"` for all 9 articles:**

| Article Title | Current Category | New Tags |
|---|---|---|
| AI starts with data: Why unified data and strong ETL pipelines... | AI & Analytics | AI, Data |
| Agentic Retail: When AI moves from insights to autonomous execution | AI & Analytics | AI, Retail |
| Redesigning the Store for Omnichannel Retail | AI & Analytics | Retail |
| When commerce works as ONE: Designing retail for SPEED and SCALE | AI & Analytics | Retail |
| From Customer-Centric to Customer-Led: Turning Understanding into Results | Retail Insights | Retail |
| Retail Technology Trends for 2026: From Tools to a True Digital Core | Retail Technology | Retail |
| Why Retailers Must Prepare for Retail-as-a-Service | Retail Innovation | Retail |
| The Case for a Commerce Data Lake in Mid-Market Retail | Data Analytics | Data, Retail |
| The Case for Unified Intelligence: How Building a Digital Core Secures Future Retail Profitability | AI & Analytics | AI, Data, Retail |

**Format:**
```json
{
  "id": "...",
  "title": "...",
  "description": "...",
  "url": "...",
  "thumbnail": "...",
  "publishedAt": 1771855813000,
  "tags": ["AI", "Data"]
}
```

### 4. Tests: `tests/e2e/blog-articles.spec.js`

**Update mock article factory (lines 98-108):**
- Change: `category: 'Retail Insights'`
- To: `tags: ['Retail']`

**Update or create category/tag badge test (lines 45-55):**
- Test still passes as long as `.bg-[#F5EEFE]` is visible
- Could enhance to verify multiple badges render when multiple tags present

### 5. Optional: Check `api/lib/fallback-articles.js` or `/api/articles.js`

- If backend also serves fallback data directly, ensure it returns correct format
- The article fetch pipeline in `blog-articles.js` will handle both old and new formats via backward compatibility check

## Tag Styling (Decision Required)

**Option A (Simple - no change):**
All tags use purple: `bg-[#F5EEFE]` and `text-[#9F7EFF]`

**Option B (Color-coded by tag):**
- AI: Purple `bg-[#F5EEFE]` / `text-[#9F7EFF]` (current)
- Data: Blue `bg-[#EEF3FE]` / `text-[#7E9FFF]`
- Retail: Green `bg-[#EEFEF5]` / `text-[#7EFFB8]`

Requires tag name check in card rendering function to apply correct class.

**Recommendation:** Start with Option A for simplicity. Option B can be added later without affecting backend.

## Backward Compatibility

- Frontend checks `article.tags` first, falls back to `[article.category]` if tags undefined
- API responses with old `category` field will continue to work
- Cached LinkedIn articles with old format won't break UI
- Gradual transition as API updates articles with new `tags` field

## Files Modified

1. `api/lib/linkedin.js` - replace extraction logic, update article mapping
2. `assets/script/modules/blog-articles.js` - render multiple badges, add fallback handling
3. `assets/data/fallback-articles.json` - update 9 articles: `category` → `tags`
4. `tests/e2e/blog-articles.spec.js` - update mock data
5. Optional: `docs/development.md` - update blog articles section if documented

## Testing Strategy

1. E2E tests verify:
   - Multiple badges render for articles with multiple tags
   - Single badge renders for articles with one tag
   - Fallback to old format works gracefully
   - Badge styling and layout unchanged

2. Manual testing:
   - Homepage insights (3 cards)
   - Blog articles page (9 cards, then Load More)
   - Responsive at 393px, 768px, 1024px, 1280px
   - No console errors

3. Build verification:
   - `npm run build` succeeds
   - `npm test` passes

## Rollout Sequence

1. Update `api/lib/linkedin.js` with new extraction logic
2. Update `assets/data/fallback-articles.json` with new tag structure
3. Update `assets/script/modules/blog-articles.js` frontend rendering
4. Update `tests/e2e/blog-articles.spec.js` mock data
5. Run full test suite (`npm test` + `npm run test:e2e`)
6. Manual browser testing at multiple breakpoints
7. Deploy

## Decision: Tag Colors

**What color scheme for tags (AI, Data, Retail)?**
- Option A: All purple (simplest, no code changes to color logic)
- Option B: Color-coded (more visual distinction, requires class selection logic)

Proceed with: **Option A** (use as default unless specified otherwise)
