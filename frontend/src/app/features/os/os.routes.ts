import { Routes } from '@angular/router'

export const OS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./os-list/os-list.component').then(m => m.OsListComponent)
  }
]
