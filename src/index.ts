#!/usr/bin/env node

import axios from 'axios'

interface Badge {
  url: string
  image: string
  description: string
}

interface BadgeSnifferInput {
  repoSlug: string
}

type BadgeSniffer = (input: BadgeSnifferInput) => Promise<Badge>

// -----------------------------------------------------------------------------

const sniffLicense: BadgeSniffer = async ({ repoSlug }) => {
  try {
    const url = `https://api.github.com/repos/${repoSlug}/license`
    const res = await axios.get(url)
    return {
      description: res.data.license.name,
      url: res.data.html_url,
      image: `https://img.shields.io/github/license/${repoSlug}.svg?color=blue`
    }
  } catch (error) {
    if (error.response.status === 429) {
      // Too many requests: rate-limiting of the public GitHub API
      // Fallback to text-sniffing
      const spellings = ['LICENSE', 'license', 'LICENSE.md', 'license.md']
      for (const license of spellings) {
        try {
          const url = `https://raw.githubusercontent.com/${repoSlug}/master/${license}`
          const res = await axios.get(url)
          return {
            description: (res.data || 'Unknown license').split('\n')[0],
            url: `https://github.com/${repoSlug}/blob/master/${license}`,
            image: `https://img.shields.io/github/license/${repoSlug}.svg?color=blue`
          }
        } catch (error) {}
      }
    }
  }
  throw new Error('Could not retrieve license data')
}

// --

const sniffTravisCI: BadgeSniffer = async ({ repoSlug }) => {
  const url = `https://raw.githubusercontent.com/${repoSlug}/master/.travis.yml`
  await axios.get(url) // Will fail if not found
  return {
    description: 'Travis CI Build', // todo: add status
    url: `https://travis-ci.com/${repoSlug}`,
    image: `https://img.shields.io/travis/com/${repoSlug}.svg`
  }
}

// --

const sniffIsItMaintainedResolutionTime: BadgeSniffer = async ({
  repoSlug
}) => {
  return {
    description: 'Average issue resolution time',
    url: `https://isitmaintained.com/project/${repoSlug}`,
    image: `https://isitmaintained.com/badge/resolution/${repoSlug}.svg`
  }
}

const sniffIsItMaintainedOpenIssues: BadgeSniffer = async ({ repoSlug }) => {
  return {
    description: 'Number of open issues',
    url: `https://isitmaintained.com/project/${repoSlug}`,
    image: `https://isitmaintained.com/badge/open/${repoSlug}.svg`
  }
}

// -----------------------------------------------------------------------------

const checkRepositoryExists = async (slug: string) => {
  try {
    await axios.get(`https://api.github.com/repos/${slug}`)
    return
  } catch (error) {
    switch (error.response.status) {
      // Failure cases
      case 404: // Not found
        throw new Error('Repository not found')
      // Fallback cases
      case 429: // Too many requests: rate-limiting of the public GitHub API
      case 503: // Service unavailable
      default:
        break
    }
    // Fallback if rate-limited or service unavailable (don't if 404)
    // try with various spellings of README.md
    const spellings = [
      'README',
      'readme',
      'Readme',
      'ReadMe',
      'README.md',
      'readme.md',
      'Readme.md',
      'ReadMe.md'
    ]
    for (const readme of spellings) {
      try {
        await axios.get(
          `https://raw.githubusercontent.com/${slug}/master/${readme}`
        )
        return
      } catch (error) {}
    }
  }
  throw new Error('Repository not found')
}

// -----------------------------------------------------------------------------

export async function getBadges(repoSlug: string): Promise<Badge[]> {
  await checkRepositoryExists(repoSlug)

  const sniffers: BadgeSniffer[] = [
    sniffLicense,
    sniffTravisCI,
    sniffIsItMaintainedResolutionTime,
    sniffIsItMaintainedOpenIssues
  ]
  let badges = []
  for (const sniff of sniffers) {
    try {
      const badge = await sniff({ repoSlug })
      badges.push(badge)
    } catch (_) {}
  }
  return badges
}

// -----------------------------------------------------------------------------

export function renderToMarkdown(badges: Badge[]): string {
  const renderBadge = ({ url, image, description }: Badge) => {
    const markdownImage = `![${description}](${image})`
    return `[${markdownImage}](${url})`
  }
  return badges.map(renderBadge).join('\n')
}

// --

async function main() {
  const slug = process.argv[2]
  try {
    const badges = await getBadges(slug)
    console.log(renderToMarkdown(badges))
  } catch (error) {
    console.error(error)
  }
}

if (require.main === module) {
  main()
}
