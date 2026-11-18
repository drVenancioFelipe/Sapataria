import { getDb } from './schema.js'

export function runSeed(): void {
  const db = getDb()

  const now = new Date().toISOString()

  // ---- Configurações ----
  const insertConfig = db.prepare(`
    INSERT OR IGNORE INTO configuracoes (chave, valor, atualizado_em) VALUES (?, ?, ?)
  `)
  const configs: [string, string][] = [
    ['loja_nome', 'Passo a Passo – Renovadora de Calçados'],
    ['loja_telefone', '(31) 3077-8190'],
    ['loja_endereco', 'Rua Gonçalo Coelho, 32C – Cidade Nova – BH – MG'],
    ['sinal_percentual', '50'],
    ['prazo_retirada_dias', '30'],
    ['prazo_doacao_dias', '90'],
    ['dias_alerta_vencimento', '3'],
    ['dias_uteis', '1,2,3,4,5,6'],
    ['lgpd_responsavel', 'Passo a Passo Renovadora de Calçados'],
    ['lgpd_contato', '(31) 3077-8190'],
    ['app_nome', 'RenovaCalçados'],
  ]
  for (const [chave, valor] of configs) {
    insertConfig.run(chave, valor, now)
  }

  // ---- Categorias ----
  const insertCat = db.prepare(`
    INSERT OR IGNORE INTO categorias_servico (nome, preco_padrao, prazo_padrao_dias, ativo, ordem)
    VALUES (?, NULL, 5, 1, ?)
  `)
  const categorias = ['Solado', 'Salto', 'Palmilha', 'Pintura', 'Costura', 'Fivela', 'Argola', 'Bolsa', 'Mala', 'Cinto', 'Remendo']
  categorias.forEach((nome, i) => insertCat.run(nome, i + 1))

  // ---- Feriados nacionais ----
  const insertFeriado = db.prepare(`
    INSERT OR IGNORE INTO feriados (nome, data, tipo, recorrente) VALUES (?, ?, 'nacional', 1)
  `)
  const feriados: [string, string][] = [
    ['Confraternização Universal', '01-01'],
    ['Tiradentes', '21-04'],
    ['Dia do Trabalho', '01-05'],
    ['Independência do Brasil', '07-09'],
    ['Nossa Senhora Aparecida', '12-10'],
    ['Finados', '02-11'],
    ['Proclamação da República', '15-11'],
    ['Consciência Negra', '20-11'],
    ['Natal', '25-12'],
  ]
  for (const [nome, data] of feriados) {
    insertFeriado.run(nome, data)
  }

  // ---- OS de exemplo ----
  const osExiste = db.prepare(`SELECT id FROM ordens_servico WHERE protocolo = 'K7M2QX'`).get()
  if (!osExiste) {
    // Criar cliente
    const clienteResult = db.prepare(`
      INSERT INTO clientes (nome, telefone, criado_em, atualizado_em)
      VALUES ('Felipe', '(31) 99999-0001', ?, ?)
    `).run(now, now)
    const clienteId = clienteResult.lastInsertRowid

    // Buscar categoria Solado
    const solado = db.prepare(`SELECT id FROM categorias_servico WHERE nome = 'Solado'`).get() as { id: number } | undefined
    const categoriaId = solado?.id ?? null

    // Criar OS
    const osResult = db.prepare(`
      INSERT INTO ordens_servico
        (protocolo, cliente_id, status, data_entrada, data_entrega_prevista, total, sinal_percentual, sinal_valor, restante, criado_em, atualizado_em)
      VALUES ('K7M2QX', ?, 'aguardando', '2026-11-07', '2026-11-11', 120.00, 50, 60.00, 60.00, ?, ?)
    `).run(clienteId, now, now)
    const osId = osResult.lastInsertRowid

    // Criar item
    db.prepare(`
      INSERT INTO os_itens (os_id, categoria_id, descricao, valor)
      VALUES (?, ?, '1 par de botas marrom: capa, raspar e hidratar', 120.00)
    `).run(osId, categoriaId)

    console.log('✅ Dados de exemplo inseridos (OS K7M2QX)')
  }

  console.log('✅ Seed concluído')
}

// Executar seed diretamente
runSeed()
