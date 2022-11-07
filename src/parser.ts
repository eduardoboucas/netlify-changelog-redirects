import parseMarkdown, { Node } from 'markdown-ast'
import semver from 'semver'

const extractVersionFromHeading = (node: Node): string | undefined => {
  if (node.type === 'text') {
    const [candidate] = node.text.split(' ')

    if (semver.valid(candidate)) {
      return candidate
    }
  }

  if (node.type === 'link') {
    return extractVersionFromHeading(node.block[0])
  }
}

export const getVersions = (changelog: string) => {
  const ast = parseMarkdown(changelog)
  const versions: string[] = []

  ast.forEach((node) => {
    if (node.type === 'title' && node.rank === 2) {
      const version = extractVersionFromHeading(node.block[0])

      if (version) {
        versions.push(version)
      }
    }
  })

  return versions
}
