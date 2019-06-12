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
  const url = `https://api.github.com/repos/${repoSlug}/license`
  const res = await axios.get(url)
  return {
    description: res.data.license.name,
    url: res.data.html_url,
    image: `https://img.shields.io/github/license/${repoSlug}.svg?color=blue`
  }
}

const sniffTravisCI: BadgeSniffer = async ({ repoSlug }) => {
  const url = `https://raw.githubusercontent.com/${repoSlug}/master/.travis.yml`
  await axios.get(url) // Will fail if not found
  return {
    description: 'Travis CI Build', // todo: add status
    url: `https://travis-ci.com/${repoSlug}`,
    image: `https://img.shields.io/travis/com/${repoSlug}.svg`
  }
}

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

const getRepositoryInfo = slug => {
  return axios.get(`https://api.github.com/repos/${slug}`)
}

// -----------------------------------------------------------------------------

export async function getBadges(repoSlug: string): Promise<Badge[]> {
  try {
    await getRepositoryInfo(repoSlug)
  } catch (error) {
    if (error.response.status === 404) {
      throw new Error('Repository not found')
    } else {
      console.error(error)
    }
  }

  const sniffers: BadgeSniffer[] = [
    sniffLicense,
    sniffTravisCI,
    sniffIsItMaintainedResolutionTime,
    sniffIsItMaintainedOpenIssues
  ]
  let badges = []
  for (let sniff of sniffers) {
    try {
      const badge = await sniff({ repoSlug })
      badges.push(badge)
    } catch (_) {}
  }
  return badges
}

// -----------------------------------------------------------------------------

export function renderToMarkdown(badges: Badge[]): string {
  const renderBadge = ({ url, image, description }) => {
    const markdownImage = `![${description}](${image})`
    return `[${markdownImage}](${url})`
  }
  return badges.map(renderBadge).join('\n')
}

// --

async function main() {
  const slug = process.argv[2]
  console.log(slug)
  const badges = await getBadges(slug)
  console.log(renderToMarkdown(badges))
}

if (require.main === module) {
  main()
}
