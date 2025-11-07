import { Tag } from 'antd'

interface MentionTextProps {
  content: string
}

// Regex to match @username (letters, numbers, underscores, hyphens)
const MENTION_REGEX = /@([a-zA-Z0-9_-]+)/g

export function MentionText({ content }: MentionTextProps) {
  if (!content) {
    return null
  }

  // Split content by mentions and create elements
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = MENTION_REGEX.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }

    // Add mention as Tag
    parts.push(
      <Tag
        key={`mention-${match.index}`}
        color="blue"
        style={{ margin: '0 2px', cursor: 'pointer' }}
      >
        {match[0]}
      </Tag>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  // If no mentions found, return original content
  if (parts.length === 0) {
    return <span>{content}</span>
  }

  return <span>{parts}</span>
}
