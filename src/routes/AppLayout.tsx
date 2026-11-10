import { Outlet } from 'react-router'
import { PageLayout } from '@/components'
import { SiteNav } from './SiteNav'

export function AppLayout() {
  return (
    <PageLayout nav={<SiteNav />}>
      <Outlet />
    </PageLayout>
  )
}
