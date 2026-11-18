import { Routes } from '@angular/router'

export const CONFIG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./configuracoes.component').then(m => m.ConfiguracoesComponent)
  }
]
