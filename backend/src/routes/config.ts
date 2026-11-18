import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../db/schema.js'

const configRoutes: FastifyPluginAsync = async (fastify) => {

  // GET / - listar todas as configurações
  fastify.get('/', async () => {
    const db = getDb()
    const rows = db.prepare(`SELECT chave, valor FROM configuracoes`).all() as { chave: string; valor: string }[]
    const config = Object.fromEntries(rows.map(r => [r.chave, r.valor]))
    return { config }
  })

  // PUT / - atualizar configurações (batch)
  fastify.put<{ Body: Record<string, string> }>('/', async (req, reply) => {
    const db = getDb()
    const now = new Date().toISOString()
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO configuracoes (chave, valor, atualizado_em) VALUES (?, ?, ?)
    `)
    const transaction = db.transaction((entries: [string, string][]) => {
      for (const [chave, valor] of entries) {
        upsert.run(chave, valor, now)
      }
    })
    transaction(Object.entries(req.body))
    return { ok: true }
  })
}

export default configRoutes
