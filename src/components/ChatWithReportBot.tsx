// src/components/ChatWithReportBot.tsx
import { useState } from 'react'

interface ChatWithReportBotProps {
  context: string
}

const ChatWithReportBot: React.FC<ChatWithReportBotProps> = ({ context }) => {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const response = await fetch('/api/chat-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, context })
    })

    const data = await response.json()
    setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-2">Chat with AI</h2>
      <div className="border rounded p-4 bg-gray-50 space-y-2 h-80 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.role === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-800'}
          >
            <p><strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}</p>
          </div>
        ))}
        {loading && <p className="text-gray-500 italic">AI is typing...</p>}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-grow border p-2 rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the report..."
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-r"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWithReportBot

