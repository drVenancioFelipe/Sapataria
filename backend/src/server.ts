import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initDb } from './db/schema.js'
import authRoutes from './routes/auth.js'
import clientesRoutes from './routes/clientes.js'
import osRoutes from './routes/os.js'
import configRoutes from './routes/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.env.PORT) || 4200
const HOST = '127.0.0.1'
const JWT_SECRET = process.env.JWT_SECRET || 'renovacalcados-dev-secret-mude-em-producao'

export const fastify = Fastify({ logger: { level: 'info' } })

// Segurança: headers
fastify.addHook('onSend', async (req, reply) => {
  reply.header('X-Frame-Options', 'DENY')
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('Referrer-Policy', 'same-origin')
  reply.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:")
})

await fastify.register(fastifyCors, { origin: [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`] })
await fastify.register(fastifyJwt, { secret: JWT_SECRET })

// Rotas da API
await fastify.register(authRoutes, { prefix: '/api/auth' })
await fastify.register(clientesRoutes, { prefix: '/api/clientes' })
await fastify.register(osRoutes, { prefix: '/api/os' })
await fastify.register(configRoutes, { prefix: '/api/config' })

// Rota health check
fastify.get('/api/health', async () => ({ status: 'ok', app: 'RenovaCalçados', ts: new Date().toISOString() }))

// Serve Angular estático
const distPath = join(__dirname, '../../frontend/dist/browser')
await fastify.register(fastifyStatic, { root: distPath, prefix: '/' })

// SPA fallback
fastify.setNotFoundHandler(async (req, reply) => {
  if (!req.url.startsWith('/api')) {
    return reply.sendFile('index.html')
  }
  reply.code(404).send({ error: 'Rota não encontrada' })
})

// Inicializar banco e subir servidor
initDb()

try {
  await fastify.listen({ port: PORT, host: HOST })
  console.log(`\n✅ RenovaCalçados rodando em http://localhost:${PORT}\n`)
  // Abrir navegador automaticamente após 1 segundo
  setTimeout(async () => {
    const { default: open } = await import('open')
    await open(`http://localhost:${PORT}`)
  }, 1000)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
