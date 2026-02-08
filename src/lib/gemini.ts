/**
 * Связь с ИИ (Gemini): генерация описаний товаров.
 * Задайте VITE_GEMINI_API_KEY в .env для работы с API.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export async function generateProductDescription(productName: string): Promise<string> {
  if (!API_KEY) {
    return `[Опишите товар: ${productName}. Добавьте VITE_GEMINI_API_KEY в .env для автогенерации.]`
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Краткое описание товара для магазина (1-2 предложения): ${productName}` }] }],
      }),
    })
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return text || `Описание для: ${productName}`
  } catch {
    return `[Ошибка запроса к Gemini. Проверьте ключ и сеть.] ${productName}`
  }
}
