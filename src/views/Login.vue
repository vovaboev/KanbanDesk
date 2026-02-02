<!-- views/Login.vue -->
<template>
  <div class="login-page">
    <!-- Фоновая Lottie анимация -->
    <div class="lottie-background">
      <Vue3Lottie
        :animation-data="loginAnimation"
        :speed="0.5"
        :loop="true"
        :auto-play="true"
        class="background-animation"
      />
    </div>

    <!-- Затемнение фона для лучшей читаемости -->
    <div class="overlay"></div>

    <!-- Контейнер с формой -->
    <div class="login-container">
      <div class="login-box" :class="{ 'shake': showError }">
        <!-- Простая иконка приветствия -->
        <div class="welcome-section">
          <div class="welcome-icon">👋</div>
          <h2 class="welcome-title">Добро пожаловать!</h2>
          <p class="welcome-subtitle">Войдите в свою учетную запись</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="input-group">
            <label for="login">
              <span class="label-icon"></span>
              Логин
            </label>
            <input 
              v-model="formData.login" 
              type="text" 
              id="login" 
              name="login" 
              required
              placeholder="Введите ваш логин"
              :class="{ 'error': errors.login }"
              @input="clearError('login')"
            />
            <div v-if="errors.login" class="error-message">{{ errors.login }}</div>
          </div>
          
          <div class="input-group">
            <label for="password">
              <span class="label-icon"></span>
              Пароль
            </label>
            <input 
              v-model="formData.password" 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              name="password" 
              required
              placeholder="Введите ваш пароль"
              :class="{ 'error': errors.password }"
              @input="clearError('password')"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="togglePasswordVisibility"
              :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>
          
          <div class="checkbox-group">
            <input 
              v-model="formData.remember" 
              type="checkbox" 
              id="remember"
              class="checkbox"
            />
            <label for="remember">Запомнить меня</label>
          </div>
          
          <div v-if="submitError" class="submit-error">
            {{ submitError }}
          </div>
          
          <button 
            type="submit" 
            class="login-btn"
            :disabled="isSubmitting || !formData.login || !formData.password"
          >
            <span v-if="isSubmitting" class="btn-loading">
              <span class="spinner"></span> Загрузка...
            </span>
            <span v-else>Войти</span>
          </button>

          <div class="auth-links">
            <p>Нет учетной записи? <router-link to="/register" class="register-link">Зарегистрироваться</router-link></p>
            <p class="forgot-password">
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { Vue3Lottie } from 'vue3-lottie'

// Импортируем ваш JSON файл
import loginAnimation from '../assets/lottie/login-animation.json'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  login: '',
  password: '',
  remember: false
})

const errors = reactive({
  login: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const showError = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const clearError = (field) => {
  if (errors[field]) {
    errors[field] = ''
    showError.value = false
  }
  if (submitError.value) {
    submitError.value = ''
  }
}

const handleForgotPassword = () => {
  alert('Функция восстановления пароля в разработке. Обратитесь к администратору.')
}

const handleSubmit = async () => {
  if (!formData.login.trim()) {
    errors.login = 'Введите логин'
    return
  }
  
  if (!formData.password) {
    errors.password = 'Введите пароль'
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  showError.value = false
  
  try {
    const user = await authStore.login({
      login: formData.login.trim(),
      password: formData.password
    })
    
    console.log('Успешный вход! Пользователь:', user)
    
    if (formData.remember) {
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('lastLogin', formData.login)
    }
    
    router.push('/dashboard')
    
  } catch (error) {
    console.error('Ошибка входа:', error)
    
    if (error.message.includes('Неверный логин или пароль') || 
        error.message.includes('Пользователь не найден')) {
      submitError.value = 'Неверный логин или пароль'
    } else if (error.message.includes('Сеть')) {
      submitError.value = 'Ошибка сети. Проверьте подключение.'
    } else {
      submitError.value = 'Ошибка при входе. Попробуйте снова.'
    }
    
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 500)
    
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const lastLogin = localStorage.getItem('lastLogin')
  const rememberMe = localStorage.getItem('rememberMe')
  
  if (rememberMe && lastLogin) {
    formData.login = lastLogin
    formData.remember = true
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: #0f172a;
}

/* Фоновая Lottie анимация */
.lottie-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.background-animation {
  width: 100% !important;
  height: 100% !important;
  opacity: 0.4;
  filter: blur(1px) brightness(0.8);
}

/* Затемнение для лучшей читаемости */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.9) 0%,
    rgba(30, 41, 59, 0.8) 50%,
    rgba(51, 65, 85, 0.7) 100%
  );
  z-index: 1;
  backdrop-filter: blur(5px);
}

/* Контейнер с формой */
.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  position: relative;
  z-index: 2;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px 35px;
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 8px 32px rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s ease;
  animation: float 6s ease-in-out infinite;
}

.login-box:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    0 12px 48px rgba(102, 126, 234, 0.3);
}

.login-box.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Секция приветствия */
.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  color: #64748b;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

/* Форма */
.login-form {
  margin-top: 10px;
}

.input-group {
  margin-bottom: 24px;
  position: relative;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #475569;
  font-weight: 600;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
  opacity: 0.8;
}

.input-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  font-family: inherit;
  background: rgba(248, 250, 252, 0.8);
  color: #1e293b;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.input-group input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-group input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 44px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  color: #94a3b8;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #667eea;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.checkbox {
  margin-right: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
  border-radius: 6px;
}

.checkbox-group label {
  color: #475569;
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
}

.login-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.submit-error {
  background: #fee;
  color: #dc2626;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 24px;
  font-size: 14px;
  text-align: center;
  animation: fadeIn 0.3s ease;
  border-left: 4px solid #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}

.auth-links {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.auth-links p {
  color: #64748b;
  font-size: 15px;
  margin-bottom: 12px;
}

.auth-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
}

.auth-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #667eea;
  transition: width 0.3s ease;
}

.auth-links a:hover::after {
  width: 100%;
}

.auth-links a:hover {
  color: #764ba2;
}

.register-link {
  color: #8b5cf6 !important;
  font-weight: 700 !important;
}

.forgot-password {
  margin-top: 8px;
}

.forgot-password a {
  font-size: 14px;
  color: #94a3b8;
}

.forgot-password a:hover {
  color: #667eea;
}

/* Адаптивность */
@media screen and (max-width: 480px) {
  .login-container {
    padding: 15px;
  }
  
  .login-box {
    padding: 30px 25px;
    margin: 15px;
  }
  
  .welcome-icon {
    font-size: 48px;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .background-animation {
    opacity: 0.3;
  }
  
  .overlay {
    background: rgba(15, 23, 42, 0.95);
  }
}

/* Анимация появления формы */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-box {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>