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

// タスク更新
app.put('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const { title, completed } = body

  // バリデーション
  if (!isNaN(id) && id <= 0) {
    return c.json({ error: 'Invalid ID format'}, 400)
  }

  try {
    const todo = await prisma.todo.update({
      where: {id},
      data: { title, completed },
    })
    return c.json(todo)
  } catch (e: any) {
    console.error('Error updating Todo:', e)

    if (e.code === 'P2025') {
      return c.json({ error: 'Todo not found'}, 404)
    }
    return c.json({ error: 'Failed to update Todo'}, 500)
  }
})

// タスク削除
app.delete('/todos/:id', async (c) => {
  const id = Number(c.req.param('id'))
  console.log('Delete Todo item ID:', id)

  // バリデーション
  if (!isNaN(id) && id <= 0) {
    return c.json({ error: 'Invalid ID format'}, 400)
  }

  try {
    await prisma.todo.delete({
      where: { id }
    })
    return c.json({ success: true })
  } catch (e: any) {
    console.error('Error updating Todo:', e)

    if (e.code === 'P2025') {
      return c.json({ error: 'Todo not found'}, 404)
    }
    return c.json({ error: 'Failed to update Todo'}, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 8080,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
