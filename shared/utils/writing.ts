/** The writing section stays out of the site until there is enough to show. */
export const MINIMUM_ARTICLES = 2

export const isWritingEnabled = (articleCount: number) => articleCount >= MINIMUM_ARTICLES
