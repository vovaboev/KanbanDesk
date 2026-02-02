// composables/useProjects.js
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { storage } from '../utils/storage'
import { generateId, getRandomColor } from '../utils/helpers'
import { DEFAULT_PROJECT_COLOR } from '../utils/constants'

export default function useProjects() {
  const authStore = useAuthStore()
  
  const projects = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Получить ключ для хранилища проектов
  const getStorageKey = () => {
    const userId = authStore.user?.id || 'guest'
    return `kanban_projects_${userId}`
  }

  // Загрузить проекты
  const loadProjects = () => {
    try {
      loading.value = true
      const storageKey = getStorageKey()
      const savedProjects = storage.get(storageKey)
      
      if (savedProjects) {
        projects.value = savedProjects.map(project => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }))
      } else {
        // Создаем демо-проект для нового пользователя
        const demoProject = {
          id: generateId('proj_'),
          title: 'Мой первый проект',
          description: 'Это демо-проект. Создавайте свои проекты и задачи!',
          color: DEFAULT_PROJECT_COLOR,
          createdAt: new Date(),
          updatedAt: new Date(),
          taskCount: 3
        }
        projects.value = [demoProject]
        saveProjects()
      }
    } catch (err) {
      error.value = 'Ошибка загрузки проектов'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Сохранить проекты
  const saveProjects = () => {
    const storageKey = getStorageKey()
    return storage.set(storageKey, projects.value)
  }

  // Создать новый проект
  const createProject = (projectData) => {
    const newProject = {
      id: generateId('proj_'),
      title: projectData.title.trim(),
      description: projectData.description?.trim() || '',
      color: projectData.color || getRandomColor(),
      createdAt: new Date(),
      updatedAt: new Date(),
      taskCount: 0
    }

    projects.value.unshift(newProject)
    saveProjects()
    return newProject
  }

  // Обновить проект
  const updateProject = (projectId, updates) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index === -1) return null

    const updatedProject = {
      ...projects.value[index],
      ...updates,
      updatedAt: new Date()
    }

    projects.value[index] = updatedProject
    saveProjects()
    return updatedProject
  }

  // Удалить проект
  const deleteProject = (projectId) => {
    if (!confirm('Удалить проект и все его задачи?')) return false

    const index = projects.value.findIndex(p => p.id === projectId)
    if (index === -1) return false

    projects.value.splice(index, 1)
    saveProjects()
    
    // Также удаляем все задачи этого проекта
    const tasksKey = `kanban_tasks_${authStore.user?.id || 'guest'}`
    const allTasks = storage.get(tasksKey) || []
    const filteredTasks = allTasks.filter(task => task.projectId !== projectId)
    storage.set(tasksKey, filteredTasks)
    
    return true
  }

  // Получить проект по ID
  const getProjectById = (projectId) => {
    return projects.value.find(p => p.id === projectId)
  }

  // Обновить счетчик задач - ИСПРАВЛЯЕМ ДЛЯ КОРРЕКТНОЙ РАБОТЫ
  const updateTaskCount = (projectId, count) => {
    const project = getProjectById(projectId)
    if (project) {
      project.taskCount = count
      project.updatedAt = new Date()
      saveProjects()
      return true
    }
    return false
  }

  // Получить статистику проектов
  const projectsStats = computed(() => {
    const totalProjects = projects.value.length
    const totalTasks = projects.value.reduce((sum, project) => sum + (project.taskCount || 0), 0)
    const activeProjects = projects.value.filter(p => !p.archived).length

    return {
      totalProjects,
      totalTasks,
      activeProjects
    }
  })

  // Инициализация
  onMounted(() => {
    loadProjects()
  })

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    updateTaskCount,
    projectsStats,
    loadProjects,
    saveProjects
  }
}