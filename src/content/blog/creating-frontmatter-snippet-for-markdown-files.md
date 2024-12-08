---
title: "How to Create and Use a Frontmatter Snippet for Markdown Files in VS Code"
summary: "Summary"
date: December, 07 2024
draft: false
tags:
  - Markdown
  - Frontmatter
  - VS Code
---

My blog is built using markdown files (MD/MDX) that rely on [frontmatter](https://mdxjs.com/guides/frontmatter/) to define key details like the title, summary, date, and tags for each post. As I’ve started writing more frequently, manually copying and pasting the frontmatter into every new file began to feel tedious. To streamline the process and save time, I decided to create a custom snippet for it, and here's how I did it.

## Creating A Snippet

To create a new snippet in Visual Studio Code, follow these steps in macOS:

- Go to **Code** > **Settings** > **Configure Snippets**.
  - If you're using Cursor, then replace **Code** with **Cursor**
- Select **markdown**. This scopes the snippet to markdown files.
- This will open a `markdown.json` file where you can add your snippet.

Below is the snippet:

```json
{
  "Frontmatter": {
    "prefix": "frontmatter",
    "body": [
      "---",
      "title: \"${1:Title}\"",
      "summary: \"${1:Summary}\"",
      "date: $CURRENT_MONTH_NAME, $CURRENT_DATE $CURRENT_YEAR",
      "draft: true",
      "tags:",
      "- ${3:Tag}",
      "---"
    ],
    "description": "Adds frontmatter to top of markdown file"
  }
}
```

To create the snippet for MDX files as well, select **mdx** to open the `mdx.json` file and add the snippet above.

## Breaking Down the Snippet

- "Frontmatter": This is the name of the snippet. If no description is provided, the name will be shown in IntelliSense.
- `prefix`: Defines one or more trigger words that activate the snippet in IntelliSense. For example, typing "frontmatter" or even "fc" would trigger this snippet.
- `body`: Contains the content that will be inserted when the snippet is triggered. Each line in the body is added in the order specified, and newlines and embedded tabs are formatted based on the context.
- `description`: This optional field provides a brief description that will appear in IntelliSense when the snippet is available.

## Snippet Syntax

The `body` of a snippet supports special constructs to control the placement of the cursor and the inserted text. Here's how to use them:

### Tabstops

Tabstops allow you to control the cursor's movement inside the snippet. Use `$1`, `$2`, etc., to specify the order in which the tabstops will be visited. `$0` is the final cursor position. If a tabstop appears multiple times in the body, it will be updated in sync.

### Placeholders

Placeholders are tabstops with predefined values. For example, `${1:foo}` will insert "foo" and make it editable. You can nest placeholders, like `${1:another ${2:placeholder}}`, to create more complex structures.

### Variables

VS Code also supports several variables. Our snippet uses the following:

- `CURRENT_MONTH_NAME`: The full name of the current month (e.g., "July").
- `CURRENT_DATE`: The day of the month (e.g., "08").
- `CURRENT_YEAR`: The current year (e.g., "2024").

A full list of variables can be found [here](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_variables).

## Using the Snippet

### Option 1:

By default, snippet suggestions don't show in markdown files. To enable the popup snippet suggestions, update your `settings.json` file to add the following:

```json
{
  //
  "[markdown]": {
    "editor.quickSuggestions": { "other": "on" }
  }
  //
}
```

Now when you start typing the prefix within your markdown file, you should see the snippet you created in a list of suggestions in a popup box. Select the snippet to add the body to your file.

### Option 2:

- Type the name of your prefix
- Use the `Ctrl+Space` command to bring up the popup snippet suggestions
- Select the snippet to add the body to your file

### Option 3:

- `Cmd+Shift+P` to bring up the command palette
- Search for **Snippets: Insert Snippet**
- You should see the snippet prefix and description a list of snippets that are valid within the scope of your file
- Select the snippet to add the body to your file

## Learn More

To learn more about using snippets and creating your own in Visual Studio Code, visit the official documentation: [Creating Your Own Snippets.](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_create-your-own-snippets)
