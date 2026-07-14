import type { ComponentType } from 'react'

type PageModule = {
  default: ComponentType
}

export type PageRoute = {
  path: string
  label: string
  folder: string
  Component: ComponentType
}

const pageModules = import.meta.glob<PageModule>('../pages/*/index.tsx', {
  eager: true,
})

function getPageFolder(filePath: string) {
  const match = filePath.match(/\.\.\/pages\/([^/]+)\/index\.tsx$/)

  if (!match) {
    throw new Error(`Invalid page module path: ${filePath}`)
  }

  return match[1]
}

function formatPageLabel(folder: string) {
  return folder
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const pageRoutes: PageRoute[] = Object.entries(pageModules)
  .map(([filePath, module]) => {
    const folder = getPageFolder(filePath)

    return {
      path: `/${folder}`,
      label: formatPageLabel(folder),
      folder,
      Component: module.default,
    }
  })
  .sort((a, b) => a.path.localeCompare(b.path))
