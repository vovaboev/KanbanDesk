import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token'))
  const user = ref(JSON.parse(localStorage.getItem('user_data')))

  const isAuthenticated = computed(() => !!token.value)

  const generateToken = () => {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2)
  }

  const login = (credentials) => {
    // Проверяем пользователя
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find(u => 
      u.login === credentials.login && u.password === credentials.password
    )

    if (!foundUser) {
      throw new Error('Неверный логин или пароль')
    }

    // Генерируем токен
    const newToken = generateToken()
    
    // Сохраняем
    token.value = newToken
    user.value = {
      id: foundUser.id,
      login: foundUser.login,
      email: foundUser.email
    }

    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('user_data', JSON.stringify(user.value))
    
    return user.value
  }

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Проверяем, не существует ли уже пользователь
    const existingUser = users.find(u => u.login === userData.login)
    if (existingUser) {
      throw new Error('Пользователь с таким логином уже существует')
    }

    // Создаем нового пользователя
    const newUser = {
      id: Date.now().toString(),
      login: userData.login,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    
    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout
  }
})