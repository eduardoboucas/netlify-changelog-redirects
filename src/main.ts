import { promises as fs } from 'fs'
import { resolve } from 'path'
import { env } from 'process'

import type { OnPostBuild } from '@netlify/build'

import { getVersions } from './parser.js'

const onPostBuild: OnPostBuild = async ({ netlifyConfig: { redirects } }) => {
  if (!env.URL) {
    console.log('URL environment variable not found. Are you running on Netlify?')

    return
  }

  const changelogPath = resolve('CHANGELOG.md')

  let changelog = ''

  try {
    changelog = await fs.readFile(changelogPath, 'utf8')
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('Changelog not found, skipped redirect generation.')

      return
    }

    throw error
  }

  const versions = getVersions(changelog)

  if (versions.length === 0) {
    console.log('No versions found in changelog.')

    return
  }

  const baseURL = new URL(env.URL)

  versions.forEach((version) => {
    redirects.push({
      from: `/${version}/*`,
      to: `https://v${version}--${baseURL.host}/:splat`,
      status: 200,
    })
  })

  console.log(`Finished generating ${versions.length} redirects.`)
}

export { onPostBuild }
