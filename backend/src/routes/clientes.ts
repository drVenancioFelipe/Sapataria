import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../db/schema.js'

const clientesRoutes: FastifyPluginAsync = async (fastify) => {

  // GET / - listar clientes
  fastify.get('/', async (req, reply) => {
    const db = getDb()
    const clientes = db.prepare(`
      SELECT * FROM clientes WHERE anonimizado = 0 ORDER BY nome
    `).all()
    return { clientes }
  })

  // GET /:id - buscar cliente
  fastify.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const db = getDb()
    const cliente = db.prepare(`SELECT * FROM clientes WHERE id = ?`).get(req.params.id)
    if (!cliente) return reply.code(404).send({ error: 'Cliente não encontrado' })
    return { cliente }
  })

  // POST / - criar cliente
  fastify.post<{ Body: { nome: string; telefone?: string } }>('/', async (req, reply) => {
    // TODO: implementar criação completa
    return reply.code(201).send({ todo: true })
  })

  // PUT /:id - atualizar cliente
  fastify.put<{ Params: { id: string } }>('/:id', async (req, reply) => {
    // TODO: implementar atualização completa
    return { todo: true }
  })
}

export default clientesRoutes
