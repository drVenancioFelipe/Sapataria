import { Injectable, inject, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'

export interface Usuario {
  id: number
  nome: string
  login: string
  perfil: 'admin' | 'atendente' | 'sapateiro'
  ultimo_acesso?: string
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient)
  private router = inject(Router)

  currentUser = signal<Usuario | null>(null)
  isAuthenticated = computed(() => !!this.currentUser())
  userPerfil = computed(() => this.currentUser()?.perfil ?? null)

  async login(login: string, senha: string): Promise<{ token: string; usuario: Usuario }> {
    const result = await firstValueFrom(
      this.http.post<{ token: string; usuario: Usuario }>('/api/auth/login', { login, senha })
    )
    localStorage.setItem('token', result.token)
    this.currentUser.set(result.usuario)
    return result
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/auth/logout', {}))
    } catch {}
    localStorage.removeItem('token')
    this.currentUser.set(null)
    this.router.navigate(['/login'])
  }

  async loadUser(): Promise<void> {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const result = await firstValueFrom(
        this.http.get<{ usuario: Usuario }>('/api/auth/me')
      )
      this.currentUser.set(result.usuario)
    } catch {
      localStorage.removeItem('token')
      this.currentUser.set(null)
    }
  }

  async needsSetup(): Promise<boolean> {
    const result = await firstValueFrom(
      this.http.get<{ needsSetup: boolean }>('/api/auth/needs-setup')
    )
    return result.needsSetup
  }
}
