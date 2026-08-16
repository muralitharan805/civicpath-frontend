import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'privacy',
    title: 'Privacy Policy — CivicPath Assembly Constituency Finder',
    loadComponent: () =>
      import('./pages/legal/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
  },
  {
    path: 'terms',
    title: 'Terms of Service — CivicPath Assembly Constituency Finder',
    loadComponent: () =>
      import('./pages/legal/terms-of-service.component').then((m) => m.TermsOfServiceComponent),
  },
];

