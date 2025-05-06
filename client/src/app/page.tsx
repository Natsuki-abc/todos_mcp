"use client";
import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const getTodos = async () => {
  const response = await fetch("http://localhost:8080/todos");
  return response.json();
};

export default function Home() {
  const query = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos, // 13行目で定義しているgetTodosを指定
  }) as { data: Todo[] | undefined };

  // messages: チャットの会話履歴が入っている配列
  // input: ユーザーがチャットに入力した内容
  // handleInputChange: ユーザーが入力内容を変更したときに呼ばれる関数（inputの内容を更新する）
  // handleSubmit: ユーザーが送信ボタンを押したときに呼ばれる関数（inputの内容をメッセージとして追加し、AIに送信する）
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",            // APIのエンドポイント
    experimental_throttle: 50,   // 1秒間に50回までのリクエストを許可
  });

  return (
    <div>
      {query.data?.map((todo) => (
        <div
          key={todo.id}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <input type="checkbox" checked={todo.completed} readOnly />
          <span>{todo.title}</span>
          <span style={{ color: "#888", fontSize: 12 }}>id: {todo.id}</span>
        </div>
      ))}
      <div>
        <form onSubmit={handleSubmit}>
          <input type="text" value={input} onChange={handleInputChange} />
          <button type="submit">send</button>
        </form>
        {messages.map((message) => (
          <div key={message.id}>{message.content}</div>
        ))}
      </div>
    </div>
  );
}
