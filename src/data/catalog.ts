export const CATALOG = [
  { id: '1', name: 'Смартфон X', price: 29990, description: 'Экран 6.1", 128 ГБ, камера 12 Мп.' },
  { id: '2', name: 'Наушники Pro', price: 4990, description: 'Беспроводные, шумоподавление, до 30 ч работы.' },
  { id: '3', name: 'Чехол универсальный', price: 790, description: 'Силикон, защита по краям.' },
  { id: '4', name: 'Зарядка быстрая 30W', price: 1490, description: 'USB-C, быстрая зарядка до 30 Вт.' },
] as const

export type ProductId = typeof CATALOG[number]['id']
