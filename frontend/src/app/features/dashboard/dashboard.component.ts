import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { AuthService } from '../../core/services/auth.service'
import { ConfigService } from '../../core/services/config.service'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header>
        <h1>{{ configService.lojaConfig()?.loja_nome ?? 'RenovaCalçados' }}</h1>
        <div class="user-info">
          <span>{{ auth.currentUser()?.nome }}</span>
          <button class="btn-danger" style="min-height:36px;padding:0 16px;font-size:0.875rem" (click)="auth.logout()">Sair</button>
        </div>
      </header>
      <nav>
        <a routerLink="/os">Ordens de Serviço</a>
        <a routerLink="/clientes">Clientes</a>
        <a routerLink="/fila">Fila</a>
        <a routerLink="/financeiro">Financeiro</a>
        <a routerLink="/configuracoes">Configurações</a>
        @if (auth.userPerfil() === 'admin') {
          <a routerLink="/admin">Administração</a>
        }
        <a routerLink="/lgpd">LGPD</a>
      </nav>
      <main>
        <p>Bem-vindo, {{ auth.currentUser()?.nome }}!</p>
        <p>Use o menu acima para navegar pelo sistema.</p>
      </main>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; min-height: 100vh; }
    header { background: var(--primary); color: #fff; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
    h1 { font-size: 1.25rem; }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    nav { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0.5rem 2rem; display: flex; gap: 1.5rem; }
    nav a { color: var(--primary); text-decoration: none; font-size: 0.95rem; }
    nav a:hover { text-decoration: underline; }
    main { padding: 2rem; }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService)
  configService = inject(ConfigService)
}
