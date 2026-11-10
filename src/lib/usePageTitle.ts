import { useEffect } from 'react'

export const SITE_NAME = 'Adverse Event Reporting Portal'

/** Sets the document title for the page, so route changes are announced by assistive technology. */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} - ${SITE_NAME}`
  }, [title])
}
