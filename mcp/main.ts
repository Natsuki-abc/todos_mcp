// MCPサーバーにツールを登録しているファイル
import { Hono } from 'hono'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { serve } from '@hono/node-server'
import { z } from 'zod'

const app = new Hono()
const mcpServer = new McpServer({
  name: 'todo-mcp-server',
  version: '1.0.0',
})

// タスク追加
async function addTodoItem(title: string) {
  const todoItem = {
    id: crypto.randomUUID(),
    title,
    completed: false,
  }

  try {
    const response = await fetch('http://localhost:8080/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todoItem }),
    })

    if (!response.ok) {
      console.error(
        `[addTodoItem] APIサーバーからエラー: ${response.status} ${response.statusText}`
      )
      return null
    }

    return await response.json()
  } catch (err: any) {
    console.error('[addTodoItem] fetchでエラー', err)
    return null
  }
}

mcpServer.tool(
  'addTodoItem',                // 第一引数：MCP経由で呼び出すときの名前
  'Add a new todo item',        // 第二引数：AIに対するツールの説明
  {
    title: z.string().min(1).describe('Title for new Todo'),
  },                            // 第三引数：ツールが受け取る引数のスキーマ定義（バリデーション）
  async ({ title }) => {
    const todoItem = await addTodoItem(title)
    return {
      content: [
        {
          type: 'text',
          text: `${title}を追加しました`,
        },
      ],
    }
  }                               // 第四引数：ツールの実行内容
)

// タスク削除
async function deleteTodoItem(id: number) {
  if (!isNaN(id) || id <= 0) {
    console.error(`[deleteTodoItem] Invalid ID format: ${id}`)
    return false
  }

  try {
    console.log('[deleteTodoItem] ID:', id)
    const response = await fetch(`http://localhost:8080/todos/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      console.error(
        `[deleteTodoItem] APIサーバーからエラー: ${response.status} ${response.statusText}`
      )
      return false
    }

    return true
  } catch (err: any) {
    console.error('[deleteTodoItem] fetchでエラー', err)
    return false
  }
}

mcpServer.tool(
  'deleteTodoItem',
  'Delete a todo item',
  {
    id: z.number().describe('ID of the Todo to delete'),
  },
  async ({ id }) => {
    console.log('[deleteTodoItem] ID:', id)
    const success = await deleteTodoItem(id)
    return {
      content: [
        {
          type: 'text',
          text: `${id}を削除しました`,
        },
      ],
    }
  }
)

// タスク更新
async function updateTodoItem(id: number, completed: boolean) {
  if (!isNaN(id) || id <= 0) {
    console.error(`[updateTodoItem] Invalid ID format: ${id}`)
    return false
  }

  try {
    const response = await fetch(`http://localhost:8080/todos/${id}`, {
      'method': 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    })

    if (!response.ok) {
      console.error(
        `[updateTodoItem] APIサーバーからエラー: ${response.status} ${response.statusText}`
      )
      return false
    }

    return true
  } catch (err: any) {
    console.error('[updateTodoItem] fetchでエラー', err)
    return false
  }
}

mcpServer.tool(
  'updateTodoItem',
  'Update a todo item',
  {
    id: z.number().describe('ID of the Todo to update'),
    completed: z.boolean().describe('Completion status of the Todo'),
  },
  async ({ id, completed }) => {
    const success = await updateTodoItem(id, completed)
    return {
      content: [
        {
          type: 'text',
          text: `${id}を更新しました`,
        },
      ],
    }
  }
)

serve({
  fetch: app.fetch,
  port: 3001,
})
console.log('[MCP} サーバーがポート3001で起動しました')