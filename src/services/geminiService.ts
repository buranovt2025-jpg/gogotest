/**
 * Сервис ИИ Gemini (ТЗ: генератор описаний + GOGO AI Помощник в чате).
 * Генератор: SellerView (описание товара). Умный помощник: ChatView (getAISupport).
 */

import { generateProductDescription as generateFromLib } from '../lib/gemini'

/** Генерация описания товара по названию и категории (модель gemini-pro). */
export async function generateAIDescription(productName: string, category?: string): Promise<string> {
  return generateFromLib(category ? `${productName} (${category})` : productName)
}

/** GOGO AI Помощник: ответы на вопросы о платформе (заглушка под gemini-3-flash-preview / getAISupport). */
export async function getAISupport(userMessage: string): Promise<string> {
  // TODO: вызов Gemini API с системным промптом про GogoMarket (часы работы, доставка, возврат и т.д.)
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key) {
    return 'Добавьте VITE_GEMINI_API_KEY для работы GOGO AI Помощника. Пока можете написать в поддержку.'
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `Ты помощник маркетплейса GogoMarket. Кратко ответь на вопрос пользователя (1-3 предложения): ${userMessage}` }],
        }],
      }),
    })
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return text || 'Не удалось получить ответ. Попробуйте переформулировать.'
  } catch {
    return 'Ошибка связи с ИИ. Попробуйте позже.'
  }
}
