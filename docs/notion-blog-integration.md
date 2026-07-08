# Notion Blog Integration Guide

This guide walks you through setting up Notion for the Artisans Cloud blog, one step at a time. It is written for people who do not code. If you can create a page in Notion and copy and paste text, you can do everything here.

Your job in this guide is to create three things in Notion and collect three keys from them. Once you have the keys, you hand them to your developer and you're done. They connect Notion to the website for you.

The three things you'll create, once:

1. **A connection** (Notion calls it an "integration"). This is a secure link that lets the website read from and write to your Notion pages. You create it once and never touch it again.
2. **A Blog Articles database.** A Notion table where you and your teammates write articles. This is the one you use every day.
3. **A Sync History database.** A second Notion table that keeps a log of every time articles are published, so anyone can see what happened and when.

The three keys you'll collect along the way:

- The connection's secret (from Step 1).
- The Blog Articles database ID (from Step 5).
- The Sync History database ID (from Step 5).

**Already set up and you just want to write an article?** Jump to [Writing and publishing an article](#writing-and-publishing-an-article).

---

## Part 1: Setting it up (do this once)

Give yourself about fifteen minutes the first time. If a teammate has already done this for your workspace, you can skip the whole of Part 1.

### Step 1: Create the connection

The connection is the private link between Notion and the website. Think of it as a dedicated login that belongs only to this automation.

1. Open [notion.so/my-integrations](https://www.notion.so/my-integrations) in your browser while you are signed in to the right Notion workspace.
2. Click **New integration**.
3. Give it a clear name so anyone can tell what it's for later. Something like `Artisans Cloud Blog Sync` works well.
4. Under **Associated workspace**, pick the workspace where your blog content will live.
5. Under **Capabilities**, turn on these three:
   - Read content
   - Update content
   - Insert content
6. Click **Save**.
7. On the next screen, look for **Internal Integration Secret** and click **Show**, then **Copy**. It's a long string that starts with `secret_` or `ntn_`.
8. Paste it somewhere safe. This is your first key. Treat it like a password. Anyone who has it can read and change your database, so don't paste it into a public place or into Notion itself.

### Step 2: Create the Blog Articles database

This is the table where articles are written.

1. In Notion, click **+ New page** in the sidebar, wherever you want the blog content to live. It can be a top-level page or tucked inside a team folder.
2. Give the page a title, for example `Blog Articles`.
3. Press Enter to go to the body, type `/table`, and pick **Table - Full page** from the menu. This gives you a proper full-page table instead of a small one inside the page.
4. Notion starts you off with a column called **Name**. Click the **Name** header, choose **Edit property**, and rename it to **Title**. The exact word matters here, because the website looks for a column called `Title`.
5. Now add the rest of the columns. Click the **+** to the right of the last column header and add each one below. Match the names and types exactly.

| Column name (exact) | Column type | What to set up |
|---|---|---|
| `Title` | Title | You already made this in step 4 by renaming `Name`. |
| `Tags` | Multi-select | Add a few starter options like `AI`, `Retail`, `Commerce`. You can always add more while writing. |
| `Hero Image URL` | Files & media | This lets writers either upload an image or paste a link to one. |
| `Status` | Select | Add exactly these three options: `Draft`, `Ready to Publish`, `Published`. The spelling and capitalization have to match, because the website looks for these exact words. |

A nice touch: color-code the `Status` options (grey for `Draft`, yellow for `Ready to Publish`, green for `Published`). It makes the table much easier to read at a glance.

### Step 3: Create the Sync History database

This second table is a running log. Every time articles are published, a new row gets added here automatically, showing the date, how many articles went out, and whether it worked. You never fill it in by hand, the website writes to it for you. It just gives everyone a clear picture of what has been published and when.

1. In Notion, create another **full-page table** the same way you did in Step 2 (type `/table`, choose **Table - Full page**).
2. Name it `Sync History`.
3. This time, keep the default **Name** column as it is. It will hold a label like `Sync 2026-07-06 14:32 UTC`.
4. Add the following columns, matching the names and types exactly:

| Column name (exact) | Column type | What it holds |
|---|---|---|
| `Name` | Title | The default column. Leave it as is. |
| `Run Date` | Date | When the publish ran. Turn on the time option in the date format if you want to see the exact time. |
| `Articles Synced` | Number | How many articles went out in that run. |
| `Titles` | Text | The titles that were published, separated by `; `. Blank if none. |
| `PR Link` | URL | A link to the published change. Blank if nothing was published. |
| `Status` | Select | Add three options: `Success`, `Failed`, `No changes`. |

Again, color-coding the `Status` options helps (green for `Success`, red for `Failed`, grey for `No changes`).

### Step 4: Connect both databases to your connection

Making the connection and making the databases does not automatically link them. You have to tell each database that it's allowed to talk to the connection. Do this for **both** the Blog Articles and the Sync History databases.

1. Open the database as a full page.
2. Click the **•••** menu in the top right corner.
3. Scroll to **Connections** and click **Connect to**.
4. Find the connection you named in Step 1 (`Artisans Cloud Blog Sync`) and click it.
5. Confirm when Notion asks.

Then repeat all five steps for the other database. If you skip this, the website simply can't see the database, even with the right key, so don't miss it.

### Step 5: Copy the two database IDs

Each Notion database has an ID, a long string of letters and numbers hiding in its web address. These are your other two keys, one for each database.

1. Open a database as a full page in your browser and look at the address bar at the top.
2. The web address looks something like this:
   ```
   https://www.notion.so/your-workspace/1a2b3c4d5e6f7890abcd1234ef567890?v=...
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          this middle part is the database ID
   ```
3. Copy the 32-character string that comes right before the `?v=`. That's the ID.
4. Do this for both databases. Label them clearly when you paste them somewhere, one is the **Blog Articles** ID and the other is the **Sync History** ID. It's easy to mix them up.

### Step 6: Hand the three keys to your developer

You now have everything the website needs. Send these three keys to your developer:

1. The connection secret from [Step 1](#step-1-create-the-connection).
2. The Blog Articles database ID from [Step 5](#step-5-copy-the-two-database-ids).
3. The Sync History database ID from Step 5.

Send them privately (a direct message or password manager), not in a public channel, since the connection secret is like a password. Your developer plugs these into the website, and after that publishing an article only needs Notion.

---

## Part 2: Writing and publishing an article

This is the everyday routine once setup is done.

1. Open the **Blog Articles** database in Notion.
2. Click **New** to create a page.
3. Fill in **Title**, pick some **Tags**, and add a **Hero Image URL** (upload an image or paste a link).
4. Write the article in the main body below the properties.
   - The very first paragraph is used as the article's search-engine description, so make it a good, clear opening.
   - Use normal Notion formatting: headings, bold, lists, quotes, and code all work.
5. When it's ready to go live, change **Status** from `Draft` to `Ready to Publish`.
6. That's it on your end. Let your developer know the article is ready. They run the publish, and once it finishes your article goes live at `https://www.artisanscloud.com/blog/{slug}` and the **Status** in Notion flips to `Published` on its own.

> **Heads up:** publishing does not happen on its own. Setting an article to `Ready to Publish` marks it as ready, but it only goes live after your developer runs the publish. Give them a nudge once it's ready.

---

## Part 3: What you fill in, and what the website handles

To keep writing simple, the website fills in most of the behind-the-scenes details for you. You only need to set a handful of fields.

**What you fill in:**

| Field | What it's for |
|---|---|
| `Title` | The headline of the article. |
| `Tags` | Categories like AI, Retail, or Commerce. |
| `Hero Image URL` | The main banner image. Upload a file or paste a link. The website downloads it, optimizes it, and stores it permanently. |
| `Status` | Set to `Ready to Publish` when you want it to go live. |

**What the website works out on its own:**

- **The web address (slug):** built from the Title. "My Guide" becomes `my-guide`.
- **The description:** taken from the first paragraph of your article.
- **The published date:** set to the day it goes live.
- **The image alt text:** set to match the Title, which helps with search and accessibility.

---

## Part 4: Editing an article that's already live

Spotted a typo or need to update a published article?

1. Find the article in the Blog Articles database.
2. Change its **Status** back to `Ready to Publish`.
3. Make your edits.
4. Let your developer know so they can run the publish again. It replaces the live version with your updated one.

---

## Part 5: Tips and things to avoid

- **Images inside the article body:** Notion's image links are temporary and eventually break. For images you want to keep permanently, ask your developer to add the image to the website and paste that link into Notion instead. The **Hero Image URL** field is safe, the website saves that one permanently on its own.
- **Keep the layout simple:** don't use multi-column layouts in Notion. The blog shows one clean, single column. Stick to headings, paragraphs, bullet and numbered lists, quotes, and images.

---

## For developers

The technical side of this (the scripts and automation that publish your articles) is documented separately in the [Notion Blog Integration Developer Reference](notion-blog-developer-guide.md).
