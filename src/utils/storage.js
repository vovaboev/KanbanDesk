// utils/storage.js
export const storage = {
  // Получить данные по ключу с учетом пользователя
  get(key, userId) {
    try {
      const storageKey = userId ? `${key}_${userId}` : key
      const data = localStorage.getItem(storageKey)
      const result = data ? JSON.parse(data) : null
      console.log(`📖 Чтение из storage: ${storageKey}`, result?.length || result)
      return result
    } catch (error) {
      console.error('❌ Ошибка чтения из localStorage:', error)
      return null
    }
  },

  // Сохранить данные с учетом пользователя
  set(key, value, userId) {
    try {
      const storageKey = userId ? `${key}_${userId}` : key
      const stringValue = JSON.stringify(value)
      localStorage.setItem(storageKey, stringValue)
      console.log(`💾 Запись в storage: ${storageKey}`, value?.length || 'object')
      return true
    } catch (error) {
      console.error('❌ Ошибка записи в localStorage:', error)
      return false
    }
  },

  // Удалить данные
  remove(key, userId) {
    try {
      const storageKey = userId ? `${key}_${userId}` : key
      localStorage.removeItem(storageKey)
      console.log(`🗑️ Удаление из storage: ${storageKey}`)
    } catch (error) {
      console.error('❌ Ошибка удаления из localStorage:', error)
    }
  },

  // Очистить все данные пользователя
  clearUserData(userId) {
    if (!userId) return
    
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.endsWith(`_${userId}`)) {
        localStorage.removeItem(key)
      }
    })
  },

  // Получить все ключи пользователя
  getUserKeys(userId) {
    if (!userId) return []
    
    const keys = Object.keys(localStorage)
    return keys.filter(key => key.endsWith(`_${userId}`))
  }
}