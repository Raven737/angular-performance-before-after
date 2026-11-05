import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'slow' },
  { path: 'slow', loadComponent: () => import('./slow/slow-page').then((m) => m.SlowPage), title: 'Slow: before' },
  { path: 'optimized', loadComponent: () => import('./optimized/optimized-page').then((m) => m.OptimizedPage), title: 'Optimized: after' },
];
