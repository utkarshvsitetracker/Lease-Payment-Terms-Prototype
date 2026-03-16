import { createBrowserRouter } from 'react-router';
import { SiteRecordPage } from './components/SiteRecordPage';
import { LeaseRecordPage } from './components/LeaseRecordPage';
import { AppShell } from './AppShell';

export const router = createBrowserRouter([
  { path: '/',               Component: SiteRecordPage },
  { path: '/lease',          Component: LeaseRecordPage },
  { path: '/payment-terms',  Component: AppShell },
], { basename: '/Lease-Payment-Terms-Prototype' });
