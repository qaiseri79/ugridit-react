import type { ReactNode } from 'react'
import type { StrapiBlock } from '../lib/strapi'

function renderNode(node: StrapiBlock, key: string): ReactNode {
  switch (node.type) {
    case 'heading':
      if (node.level === 1) return <h1 key={key}>{renderChildren(node, key)}</h1>
      if (node.level === 2) return <h2 key={key}>{renderChildren(node, key)}</h2>
      if (node.level === 3) return <h3 key={key}>{renderChildren(node, key)}</h3>
      return <h4 key={key}>{renderChildren(node, key)}</h4>
    case 'paragraph':
      return <p key={key}>{renderChildren(node, key)}</p>
    case 'list':
      return (
        <ul key={key}>
          {node.children?.map((child, i) => renderNode(child, `${key}-li-${i}`))}
        </ul>
      )
    case 'listItem':
      return <li key={key}>{renderChildren(node, key)}</li>
    case 'link':
      return (
        <a key={key} href={node.url} target="_blank" rel="noreferrer">
          {renderChildren(node, key)}
        </a>
      )
    case 'text':
      return <span key={key}>{node.text}</span>
    default:
      return renderChildren(node, key)
  }
}

function renderChildren(node: StrapiBlock, key: string): ReactNode {
  return (
    node.children?.map((child, i) => renderNode(child, `${key}-child-${i}`)) ??
    null
  )
}

export default function Blocks({ blocks }: { blocks: StrapiBlock[] }) {
  return <>{blocks.map((block, i) => renderNode(block, `block-${i}`))}</>
}