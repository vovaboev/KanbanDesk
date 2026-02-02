// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

// Lazy loading для производительности
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const ProjectView = () => import('../views/ProjectView.vue')

const routes = [
  { 
    path: '/', 
    redirect: '/dashboard'
  },
  { 
    path: '/login', 
    name: 'Login',
    component: Login,
    meta: { guestOnly: true, title: 'Вход' }
  },
  { 
    path: '/register', 
    name: 'Register',
    component: Register,
    meta: { guestOnly: true, title: 'Регистрация' }
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, title: 'Мои проекты' }
  },
  { 
    path: '/project/:id', 
    name: 'Project',
    component: ProjectView,
    meta: { requiresAuth: true, title: 'Проект' },
    props: true
  },
  // 404 страница
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Глобальные guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Устанавливаем заголовок страницы
  if (to.meta.title) {
    document.title = `${to.meta.title} | Канбан Доска`
  }

  // Проверка авторизации
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router