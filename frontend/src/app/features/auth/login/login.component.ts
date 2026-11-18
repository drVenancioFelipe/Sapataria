import { Component, inject, signal, OnInit } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { AuthService } from '../../core/services/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>RenovaCalçados</h1>
        <h2>Entrar no sistema</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="login">Usuário</label>
            <input id="login" type="text" formControlName="login" autocomplete="username" />
          </div>
          <div class="field">
            <label for="senha">Senha</label>
            <input id="senha" type="password" formControlName="senha" autocomplete="current-password" />
          </div>
          @if (erro()) {
            <p class="erro">{{ erro() }}</p>
          }
          <button type="submit" class="btn-primary" [disabled]="carregando()">
            {{ carregando() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg); }
    .login-card { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem; width: 100%; max-width: 400px; }
    h1 { font-size: 1.5rem; color: var(--primary); margin-bottom: 0.25rem; }
    h2 { font-size: 1rem; color: var(--text-secondary); margin-bottom: 1.5rem; font-weight: 400; }
    .field { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
    label { font-size: 0.875rem; color: var(--text-secondary); }
    input { padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius); font-size: 1rem; }
    button { width: 100%; margin-top: 1rem; }
    .erro { color: var(--warn); font-size: 0.875rem; margin-top: 0.5rem; }
  `]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  form = this.fb.group({
    login: ['', Validators.required],
    senha: ['', Validators.required]
  })
  carregando = signal(false)
  erro = signal('')

  async ngOnInit() {
    const needsSetup = await this.auth.needsSetup()
    if (needsSetup) {
      this.router.navigate(['/setup'])
    }
  }

  async onSubmit() {
    if (this.form.invalid) return
    this.carregando.set(true)
    this.erro.set('')
    try {
      await this.auth.login(this.form.value.login!, this.form.value.senha!)
      this.router.navigate(['/dashboard'])
    } catch (e: any) {
      this.erro.set(e?.error?.error ?? 'Erro ao fazer login')
    } finally {
      this.carregando.set(false)
    }
  }
}
