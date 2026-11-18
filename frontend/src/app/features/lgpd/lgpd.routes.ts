import { Routes } from '@angular/router'

export const LGPD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lgpd.component').then(m => m.LgpdComponent)
  }
]
