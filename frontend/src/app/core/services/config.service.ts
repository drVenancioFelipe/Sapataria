import { Injectable, inject, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'

export interface LojaConfig {
  loja_nome: string
  loja_telefone: string
  loja_endereco: string
  sinal_percentual: string
  prazo_retirada_dias: string
  prazo_doacao_dias: string
  dias_alerta_vencimento: string
  dias_uteis: string
  app_nome: string
  [key: string]: string
}

export const APP_NAME = 'RenovaCalçados'

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient)

  lojaConfig = signal<LojaConfig | null>(null)

  async loadConfig(): Promise<void> {
    try {
      const result = await firstValueFrom(
        this.http.get<{ config: LojaConfig }>('/api/config')
      )
      this.lojaConfig.set(result.config)
    } catch (err) {
      console.error('Erro ao carregar configurações', err)
    }
  }
}
