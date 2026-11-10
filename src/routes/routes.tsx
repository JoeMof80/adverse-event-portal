import type { RouteObject } from 'react-router'
import { AuthorisePage } from '@/pages/AuthorisePage'
import { CallbackPage } from '@/pages/CallbackPage'
import { HomeRedirect } from '@/pages/HomeRedirect'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SignInPage } from '@/pages/SignInPage'
import { NewReportPage } from '@/pages/reporter/NewReportPage'
import { ReporterHomePage } from '@/pages/reporter/ReporterHomePage'
import { ReportDetailPage } from '@/pages/review/ReportDetailPage'
import { ReviewQueuePage } from '@/pages/review/ReviewQueuePage'
import { AUTHORIZE_PATH, CALLBACK_PATH } from '@/auth/oidc'
import { AppLayout } from './AppLayout'
import { RequireAuth, RequireRole } from './guards'

export const routes: RouteObject[] = [
  { path: '/sign-in', Component: SignInPage },
  { path: AUTHORIZE_PATH, Component: AuthorisePage },
  { path: CALLBACK_PATH, Component: CallbackPage },
  {
    Component: RequireAuth,
    children: [
      {
        Component: AppLayout,
        children: [
          { index: true, Component: HomeRedirect },
          {
            element: <RequireRole roles={['reporter']} />,
            children: [
              { path: '/reporter', Component: ReporterHomePage },
              { path: '/reporter/new', Component: NewReportPage },
            ],
          },
          {
            element: <RequireRole roles={['reviewer', 'admin']} />,
            children: [
              { path: '/review', Component: ReviewQueuePage },
              { path: '/review/:reportId', Component: ReportDetailPage },
            ],
          },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
]
