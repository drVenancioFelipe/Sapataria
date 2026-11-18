import { Routes } from '@angular/router'

export const FINANCEIRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./financeiro.component').then(m => m.FinanceiroComponent)
  }
]
