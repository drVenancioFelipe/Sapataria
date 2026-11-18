import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../db/schema.js'

const osRoutes: FastifyPluginAsync = async (fastify) => {

  // GET / - listar ordens de serviço
  fastify.get('/', async (req, reply) => {
    const db = getDb()
    const ordens = db.prepare(`
      SELECT os.*, c.nome as cliente_nome, c.telefone as cliente_telefone
      FROM ordens_servico os
      LEFT JOIN clientes c ON os.cliente_id = c.id
      ORDER BY os.data_entrada DESC
    `).all()
    return { ordens }
  })

  // GET /:protocolo - buscar OS por protocolo
  fastify.get<{ Params: { protocolo: string } }>('/:protocolo', async (req, reply) => {
    const db = getDb()
    const os = db.prepare(`
      SELECT os.*, c.nome as cliente_nome, c.telefone as cliente_telefone
      FROM ordens_servico os
      LEFT JOIN clientes c ON os.cliente_id = c.id
      WHERE os.protocolo = ?
    `).get(req.params.protocolo)

    if (!os) return reply.code(404).send({ error: 'OS não encontrada' })

    const itens = db.prepare(`SELECT * FROM os_itens WHERE os_id = ?`).all((os as any).id)
    const fotos = db.prepare(`SELECT * FROM os_fotos WHERE os_id = ? ORDER BY ordem`).all((os as any).id)

    return { os, itens, fotos }
  })

  // POST / - criar OS
  fastify.post('/', async (req, reply) => {
    // TODO: implementar criação completa
    return reply.code(201).send({ todo: true })
  })

  // PUT /:id/status - atualizar status
  fastify.put<{ Params: { id: string }; Body: { status: string } }>('/:id/status', async (req, reply) => {
    // TODO: implementar atualização de status
    return { todo: true }
  })
}

export default osRoutes
