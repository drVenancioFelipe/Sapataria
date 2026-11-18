import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'setup',
    loadComponent: () => import('./features/auth/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'os',
    canActivate: [authGuard],
    loadChildren: () => import('./features/os/os.routes').then(m => m.OS_ROUTES)
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
  },
  {
    path: 'fila',
    canActivate: [authGuard],
    loadComponent: () => import('./features/fila/fila.component').then(m => m.FilaComponent)
  },
  {
    path: 'financeiro',
    canActivate: [authGuard],
    loadChildren: () => import('./features/financeiro/financeiro.routes').then(m => m.FINANCEIRO_ROUTES)
  },
  {
    path: 'configuracoes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/configuracoes/configuracoes.routes').then(m => m.CONFIG_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'lgpd',
    canActivate: [authGuard],
    loadChildren: () => import('./features/lgpd/lgpd.routes').then(m => m.LGPD_ROUTES)
  },
  { path: '**', redirectTo: 'dashboard' }
]
