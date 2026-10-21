export type NewsletterIssue = {
  title: string
  link: string
  date: Date
  summary: string
}

const FEED_URL = "https://buttondown.com/opentabs/rss?count=50"

function decodeXmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function stripHtml(html: string) {
  return decodeXmlEntities(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getTag(block: string, tag: string) {
  const cdata = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
  if (cdata?.[1]) return cdata[1].trim()

  const plain = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return plain?.[1]?.trim() ?? ""
}

function parseIssues(xml: string): NewsletterIssue[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

  return items
    .map((match) => {
      const block = match[1]
      const title = decodeXmlEntities(getTag(block, "title"))
      const link = getTag(block, "link")
      const pubDate = getTag(block, "pubDate")
      const description = getTag(block, "description")
      const summary = stripHtml(description)

      if (!title || !link || !pubDate) return null

      return {
        title,
        link,
        date: new Date(pubDate),
        summary: summary.slice(0, 180) + (summary.length > 180 ? "…" : ""),
      }
    })
    .filter((issue): issue is NewsletterIssue => issue !== null)
}

export async function getNewsletterIssues(): Promise<NewsletterIssue[]> {
  try {
    const response = await fetch(FEED_URL)
    if (!response.ok) {
      console.warn(`Buttondown RSS fetch failed: ${response.status}`)
      return []
    }

    const xml = await response.text()
    return parseIssues(xml)
  } catch (error) {
    console.warn("Buttondown RSS fetch failed:", error)
    return []
  }
}
