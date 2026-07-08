// scripts/lib/notion-to-markdown.js
//
// Converts Notion rich text and block arrays to Markdown.
// Used by scripts/sync-notion.js to turn Notion page content into .md files.

export function richTextToMarkdown(richTexts) {
  return richTexts
    .map((rt) => {
      let text = rt.plain_text;
      if (rt.href) text = `[${text}](${rt.href})`;
      if (rt.annotations.code) text = `\`${text}\``;
      if (rt.annotations.bold) text = `**${text}**`;
      if (rt.annotations.italic) text = `_${text}_`;
      if (rt.annotations.strikethrough) text = `~~${text}~~`;
      
      if (rt.annotations.color && rt.annotations.color !== "default") {
        const colorMap = {
          "gray": "color: gray;",
          "brown": "color: #A52A2A;",
          "orange": "color: orange;",
          "yellow": "color: #eab308;",
          "green": "color: green;",
          "blue": "color: blue;",
          "purple": "color: purple;",
          "pink": "color: pink;",
          "red": "color: red;",
          "gray_background": "background-color: lightgray;",
          "brown_background": "background-color: #f3e5f5;",
          "orange_background": "background-color: #ffe0b2;",
          "yellow_background": "background-color: #fff9c4;",
          "green_background": "background-color: #c8e6c9;",
          "blue_background": "background-color: #bbdefb;",
          "purple_background": "background-color: #e1bee7;",
          "pink_background": "background-color: #f8bbd0;",
          "red_background": "background-color: #ffcdd2;"
        };
        const style = colorMap[rt.annotations.color];
        if (style) {
          text = `<span style="${style}">${text}</span>`;
        }
      }
      
      return text;
    })
    .join("");
}

export function blocksToMarkdown(blocks) {
  const lines = [];
  let numberedIndex = 1;

  for (const block of blocks) {
    const type = block.type;
    const data = block[type];

    if (type !== "numbered_list_item") numberedIndex = 1;

    switch (type) {
      case "paragraph":
        lines.push(richTextToMarkdown(data.rich_text) || "");
        lines.push("");
        break;
      case "heading_1":
        lines.push(`# ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "heading_2":
        lines.push(`## ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "heading_3":
        lines.push(`### ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "bulleted_list_item":
        lines.push(`- ${richTextToMarkdown(data.rich_text)}`);
        break;
      case "numbered_list_item":
        lines.push(`${numberedIndex}. ${richTextToMarkdown(data.rich_text)}`);
        numberedIndex++;
        break;
      case "quote":
        lines.push(`> ${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      case "code":
        lines.push(`\`\`\`${data.language || ""}`);
        lines.push(richTextToMarkdown(data.rich_text));
        lines.push("```");
        lines.push("");
        break;
      case "image": {
        const url = data.type === "external" ? data.external.url : data.file.url;
        const caption = data.caption?.length ? richTextToMarkdown(data.caption) : "";
        lines.push(`![${caption}](${url})`);
        lines.push("");
        break;
      }
      case "divider":
        lines.push("---");
        lines.push("");
        break;
      case "callout": {
        const emoji = data.icon?.emoji ? `${data.icon.emoji} ` : "";
        lines.push(`> ${emoji}${richTextToMarkdown(data.rich_text)}`);
        lines.push("");
        break;
      }
      default:
        break;
    }
  }

  return lines.join("\n").trim();
}
