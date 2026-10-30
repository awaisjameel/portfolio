import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
]

/** Runs headless Chrome once with the given arguments, in a throwaway profile. */
export function runChrome(args) {
  const binary = CANDIDATES.find((candidate) => candidate && existsSync(candidate))
  if (!binary) throw new Error('Chrome or Edge not found. Set CHROME_PATH.')
  const profile = mkdtempSync(join(tmpdir(), 'portfolio-chrome-'))
  try {
    execFileSync(
      binary,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        `--user-data-dir=${profile}`,
        ...args
      ],
      { stdio: 'ignore', timeout: 60_000 }
    )
  } finally {
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
  }
}
