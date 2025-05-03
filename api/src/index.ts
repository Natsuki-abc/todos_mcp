import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient } from '../generated/prisma/index.js'

const app = new Hono()
const prisma =new PrismaClient()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/system/ping', (c) => {
  return c.json({ message: 'pong' })
})

// タスク一覧取得
app.get('/todos', async (c) => {
  const todos = await prisma.todo.findMany()
  return c.json(todos)
})

// タスク追加
app.post('/todos', async (c) => {
  const body = await c.req.json()
  const { title } = body
  if (!title) {
    return c.json({ error: 'Title is required'}, 400)
  }
  const todo = await prisma.todo.create({
    data: { title }
  })
  return c.json(todo)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
