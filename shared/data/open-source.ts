export type Tech = 'Laravel' | 'Node' | 'Go' | 'Vue' | 'Tooling'

export interface OpenSourceProject {
  name: string
  description: string
  href: string
  repo?: string
  tech: Tech[]
  /** Registry package name, used to look up its install or download count. */
  registry?: { source: 'packagist' | 'npm'; name: string }
  note?: string
}

export interface OpenSourceGroup {
  title: string
  projects: OpenSourceProject[]
}

const github = (repo: string) => `https://github.com/awaisjameel/${repo}`
const packagist = (name: string) => ({ source: 'packagist' as const, name: `awaisjameel/${name}` })
const packagistUrl = (name: string) => `https://packagist.org/packages/awaisjameel/${name}`

export const openSourceGroups: OpenSourceGroup[] = [
  {
    title: 'Laravel packages',
    projects: [
      {
        name: 'laravel-address-parser',
        description: 'Parse messy single-line US addresses into structured parts.',
        href: packagistUrl('laravel-address-parser'),
        repo: github('laravel-address-parser'),
        tech: ['Laravel'],
        registry: packagist('laravel-address-parser')
      },
      {
        name: 'texto',
        description: 'SMS, MMS, and WhatsApp gateway for Twilio, Telnyx, and Meta.',
        href: packagistUrl('texto'),
        repo: github('texto'),
        tech: ['Laravel'],
        registry: packagist('texto')
      },
      {
        name: 'didit-laravel-client',
        description: 'Community-built DiDiT identity verification client for Laravel.',
        href: packagistUrl('didit-laravel-client'),
        repo: github('didit-laravel-client'),
        tech: ['Laravel'],
        registry: packagist('didit-laravel-client')
      },
      {
        name: 'mimetypes',
        description: 'Cached MIME type and extension resolution.',
        href: packagistUrl('mimetypes'),
        repo: github('MimeTypes'),
        tech: ['Laravel'],
        registry: packagist('mimetypes')
      },
      {
        name: 'base64filehandler',
        description: 'Validate and store base64 file payloads.',
        href: packagistUrl('base64filehandler'),
        repo: github('Base64FileHandler'),
        tech: ['Laravel'],
        registry: packagist('base64filehandler')
      },
      {
        name: 'laravel-cpanel-hosting',
        description: 'Make deploying Laravel on cPanel and shared hosting safer.',
        href: packagistUrl('laravel-cpanel-hosting'),
        repo: github('laravel-cpanel-hosting'),
        tech: ['Laravel'],
        registry: packagist('laravel-cpanel-hosting')
      }
    ]
  },
  {
    title: 'Node packages',
    projects: [
      {
        name: 'didit-node-client',
        description: 'Community-built, typed DiDiT client for sessions, KYC/KYB, and webhooks.',
        href: 'https://www.npmjs.com/package/didit-node-client',
        repo: github('didit-node-client'),
        tech: ['Node'],
        registry: { source: 'npm', name: 'didit-node-client' }
      },
      {
        name: 'video-to-thumbnail',
        description: 'FFmpeg thumbnails from local or remote video, with concurrency control.',
        href: 'https://www.npmjs.com/package/video-to-thumbnail',
        repo: github('video-to-thumbnail'),
        tech: ['Node'],
        registry: { source: 'npm', name: 'video-to-thumbnail' }
      }
    ]
  },
  {
    title: 'Products and starters',
    projects: [
      {
        name: 'lumen',
        description: 'On-device AI desktop photo gallery in Go.',
        href: github('lumen'),
        tech: ['Go', 'Vue']
      },
      {
        name: 'laravel-starter-kit',
        description: 'Modular, typed Laravel 13 and Inertia 3 starter.',
        href: github('laravel-starter-kit'),
        tech: ['Laravel', 'Vue']
      },
      {
        name: 'laravel-ecommerce-starter-kit',
        description: 'Laravel commerce starter.',
        href: github('laravel-ecommerce-starter-kit'),
        tech: ['Laravel']
      },
      {
        name: 'laravel-api-starter-kit',
        description: 'API-only Laravel starter and reference project.',
        href: github('laravel-api-starter-kit'),
        tech: ['Laravel'],
        note: 'Fork'
      },
      {
        name: 'vuetify-laravel-boilerplate',
        description: 'Laravel and Vuetify boilerplate from 2020.',
        href: github('vuetify-laravel-boilerplate'),
        tech: ['Laravel', 'Vue'],
        note: 'Historical'
      }
    ]
  },
  {
    title: 'Tools and scripts',
    projects: [
      {
        name: 'Laravel-Project-Backup-Command',
        description: 'Artisan commands to back up and restore a Laravel project.',
        href: github('Laravel-Project-Backup-Command'),
        tech: ['Laravel', 'Tooling']
      },
      {
        name: 'Bash-Scripts',
        description: 'Server setup and maintenance scripts.',
        href: github('Bash-Scripts'),
        tech: ['Tooling']
      },
      {
        name: 'automation-scripts',
        description: 'Server and network automation.',
        href: github('automation-scripts'),
        tech: ['Tooling']
      },
      {
        name: 'address-parser',
        description: 'Earlier standalone address parser, replaced by laravel-address-parser.',
        href: github('address-parser'),
        tech: ['Tooling'],
        note: 'Superseded'
      }
    ]
  }
]

export const techFilters: Tech[] = ['Laravel', 'Node', 'Go', 'Vue', 'Tooling']

/** Home page highlights, ordered by real use once counts are known. */
export const highlightNames = [
  'laravel-address-parser',
  'didit-node-client',
  'texto',
  'didit-laravel-client'
]

export const allProjects = openSourceGroups.flatMap((group) => group.projects)
