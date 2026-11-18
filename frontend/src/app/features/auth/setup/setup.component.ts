import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <h1>RenovaCalçados</h1>
        <h2>Configuração inicial</h2>
        <p class="info">Crie o usuário administrador do sistema.</p>
        @if (!concluido()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label>Nome completo</label>
              <input type="text" formControlName="nome" />
            </div>
            <div class="field">
              <label>Login (usuário)</label>
              <input type="text" formControlName="login" autocomplete="new-password" />
            </div>
            <div class="field">
              <label>Senha</label>
              <input type="password" formControlName="senha" autocomplete="new-password" />
            </div>
            @if (erro()) {
              <p class="erro">{{ erro() }}</p>
            }
            <button type="submit" class="btn-primary" [disabled]="carregando()">
              {{ carregando() ? 'Configurando...' : 'Criar administrador' }}
            </button>
          </form>
        } @else {
          <div class="sucesso">
            <p>✅ Administrador criado com sucesso!</p>
            <p class="chave-label">Chave de recuperação (guarde em lugar seguro):</p>
            <code>{{ chaveRecuperacao() }}</code>
            <button class="btn-primary" (click)="irParaLogin()">Ir para o login</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .setup-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg); }
    .setup-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem; width: 100%; max-width: 440px; }
    h1 { font-size: 1.5rem; color: var(--primary); margin-bottom: 0.25rem; }
    h2 { font-size: 1rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 400; }
    .info { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.5rem; }
    .field { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
    label { font-size: 0.875rem; color: var(--text-secondary); }
    input { padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius); font-size: 1rem; }
    button { width: 100%; margin-top: 1rem; }
    .erro { color: var(--warn); font-size: 0.875rem; }
    .sucesso { text-align: center; }
    .chave-label { margin: 1rem 0 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
    code { display: block; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 0.75rem; font-size: 0.95rem; word-break: break-all; margin-bottom: 1rem; }
  `]
})
export class SetupComponent {
  private http = inject(HttpClient)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  form = this.fb.group({
    nome: ['', Validators.required],
    login: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  })
  carregando = signal(false)
  erro = signal('')
  concluido = signal(false)
  chaveRecuperacao = signal('')

  async onSubmit() {
    if (this.form.invalid) return
    this.carregando.set(true)
    this.erro.set('')
    try {
      const result = await firstValueFrom(
        this.http.post<{ chave_recuperacao: string }>('/api/auth/setup', this.form.value)
      )
      this.chaveRecuperacao.set(result.chave_recuperacao)
      this.concluido.set(true)
    } catch (e: any) {
      this.erro.set(e?.error?.error ?? 'Erro ao configurar sistema')
    } finally {
      this.carregando.set(false)
    }
  }

  irParaLogin() {
    this.router.navigate(['/login'])
  }
}
