import type { FastifyPluginAsync } from 'fastify'
import { getDb } from '../db/schema.js'
import * as argon2 from 'argon2'
import { nanoid } from 'nanoid'

const authRoutes: FastifyPluginAsync = async (fastify) => {

  // GET /needs-setup
  fastify.get('/needs-setup', async () => {
    const db = getDb()
    const admin = db.prepare(`SELECT id FROM usuarios WHERE perfil = 'admin' AND ativo = 1 LIMIT 1`).get()
    return { needsSetup: !admin }
  })

  // POST /setup - cria admin inicial (apenas se não houver admin)
  fastify.post<{ Body: { nome: string; login: string; senha: string } }>('/setup', async (req, reply) => {
    const db = getDb()
    const adminExiste = db.prepare(`SELECT id FROM usuarios WHERE perfil = 'admin' LIMIT 1`).get()
    if (adminExiste) {
      return reply.code(403).send({ error: 'Setup já realizado' })
    }

    const { nome, login, senha } = req.body
    if (!nome || !login || !senha) {
      return reply.code(400).send({ error: 'nome, login e senha são obrigatórios' })
    }

    const senhaHash = await argon2.hash(senha)
    const now = new Date().toISOString()
    const chaveRecuperacao = nanoid(24)

    db.prepare(`
      INSERT INTO usuarios (nome, login, senha_hash, perfil, ativo, criado_em)
      VALUES (?, ?, ?, 'admin', 1, ?)
    `).run(nome, login, senhaHash, now)

    // Salvar chave de recuperação nas configurações
    db.prepare(`
      INSERT OR REPLACE INTO configuracoes (chave, valor, atualizado_em) VALUES ('chave_recuperacao', ?, ?)
    `).run(chaveRecuperacao, now)

    return { chave_recuperacao: chaveRecuperacao }
  })

  // POST /login
  fastify.post<{ Body: { login: string; senha: string } }>('/login', async (req, reply) => {
    const db = getDb()
    const { login, senha } = req.body

    if (!login || !senha) {
      return reply.code(400).send({ error: 'login e senha são obrigatórios' })
    }

    const usuario = db.prepare(`
      SELECT * FROM usuarios WHERE login = ? AND ativo = 1
    `).get(login) as any

    if (!usuario) {
      return reply.code(401).send({ error: 'Credenciais inválidas' })
    }

    // Verificar bloqueio
    if (usuario.bloqueado_ate && new Date(usuario.bloqueado_ate) > new Date()) {
      return reply.code(429).send({ error: 'Conta temporariamente bloqueada. Tente novamente mais tarde.' })
    }

    const senhaOk = await argon2.verify(usuario.senha_hash, senha)

    if (!senhaOk) {
      const tentativas = (usuario.tentativas_falha || 0) + 1
      const bloqueadoAte = tentativas >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
      db.prepare(`
        UPDATE usuarios SET tentativas_falha = ?, bloqueado_ate = ? WHERE id = ?
      `).run(tentativas, bloqueadoAte, usuario.id)
      return reply.code(401).send({ error: 'Credenciais inválidas' })
    }

    // Reset tentativas
    const now = new Date().toISOString()
    db.prepare(`
      UPDATE usuarios SET tentativas_falha = 0, bloqueado_ate = NULL, ultimo_acesso = ? WHERE id = ?
    `).run(now, usuario.id)

    // Gerar JWT
    const token = fastify.jwt.sign(
      { id: usuario.id, login: usuario.login, perfil: usuario.perfil },
      { expiresIn: '30m' }
    )

    // Salvar sessão
    const expiraEm = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    db.prepare(`
      INSERT INTO sessoes (usuario_id, token, expira_em, criado_em) VALUES (?, ?, ?, ?)
    `).run(usuario.id, token, expiraEm, now)

    return {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil }
    }
  })

  // POST /logout
  fastify.post('/logout', async (req, reply) => {
    try {
      const authHeader = req.headers.authorization
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const db = getDb()
        db.prepare(`DELETE FROM sessoes WHERE token = ?`).run(token)
      }
    } catch {}
    return { ok: true }
  })

  // GET /me
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (req) => {
    const payload = req.user as any
    const db = getDb()
    const usuario = db.prepare(`
      SELECT id, nome, login, perfil, ultimo_acesso FROM usuarios WHERE id = ?
    `).get(payload.id)
    return { usuario }
  })
}

// Decorator para autenticação
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any
  }
}

export default authRoutes
