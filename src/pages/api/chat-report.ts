// pages/api/chat-report.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const { messages, context } = req.body

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a senior MongoDB expert. Answer the user's questions based on this analysis context:

${context}
`
        },
        ...messages
      ],
      temperature: 0.4
    })

    const reply = response.choices[0].message.content
    res.status(200).json({ reply })
  } catch (err) {
    console.error('OpenAI error:', err)
    res.status(500).json({ error: 'Failed to get AI response' })
  }
}

