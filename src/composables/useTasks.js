// composables/useTasks.js
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { storage } from '../utils/storage'
import { generateId, getDeadlineStatus } from '../utils/helpers'
import { TASK_STATUSES } from '../utils/constants'

export default function useTasks(projectId) {
  const authStore = useAuthStore()
  
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Получить ключ для хранилища задач
  const getStorageKey = () => {
    const userId = authStore.user?.id || 'guest'
    return `kanban_tasks_${userId}`
  }

  // Получить ключ для хранилища проектов
  const getProjectsStorageKey = () => {
    const userId = authStore.user?.id || 'guest'
    return `kanban_projects_${userId}`
  }

  // Обновить счетчик задач в проекте
  const updateProjectTaskCount = () => {
    if (!projectId) return
    
    const projectsKey = getProjectsStorageKey()
    const projects = storage.get(projectsKey) || []
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex !== -1) {
      projects[projectIndex].taskCount = tasks.value.length
      projects[projectIndex].updatedAt = new Date().toISOString()
      storage.set(projectsKey, projects)
    }
  }

  // Загрузить задачи проекта
  const loadProjectTasks = () => {
    try {
      loading.value = true
      const storageKey = getStorageKey()
      const allTasks = storage.get(storageKey) || []
      
      // Фильтруем задачи по проекту и преобразуем даты
      tasks.value = allTasks
        .filter(task => task.projectId === projectId)
        .map(task => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline) : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }))
        .sort((a, b) => a.position - b.position)
      
      // Обновляем счетчик задач после загрузки
      updateProjectTaskCount()
      
    } catch (err) {
      error.value = 'Ошибка загрузки задач'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Сохранить все задачи
  const saveTasks = () => {
    const storageKey = getStorageKey()
    
    // Получаем все задачи пользователя
    const allTasks = storage.get(storageKey) || []
    
    // Обновляем только задачи текущего проекта
    const otherTasks = allTasks.filter(task => task.projectId !== projectId)
    const updatedTasks = [...otherTasks, ...tasks.value.map(task => ({
      ...task,
      deadline: task.deadline ? task.deadline.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }))]
    
    const result = storage.set(storageKey, updatedTasks)
    
    // Обновляем счетчик задач в проекте
    if (result) {
      updateProjectTaskCount()
    }
    
    return result
  }

  // Создать новую задачу - ИСПРАВЛЯЕМ: НЕ ПРИНИМАЕМ projectId как параметр
  const createTask = (taskData) => {
    const newTask = {
      id: generateId('task_'),
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      status: taskData.status || TASK_STATUSES.BACKLOG,
      projectId: projectId, // Берем projectId из замыкания
      deadline: taskData.deadline ? new Date(taskData.deadline) : null,
      assignee: taskData.assignee?.trim() || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      position: tasks.value.filter(t => t.status === taskData.status).length
    }

    tasks.value.push(newTask)
    saveTasks()
    return newTask
  }

  // Обновить задачу
  const updateTask = (taskId, updates) => {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index === -1) return null

    const updatedTask = {
      ...tasks.value[index],
      ...updates,
      updatedAt: new Date()
    }

    tasks.value[index] = updatedTask
    saveTasks()
    return updatedTask
  }

  // Удалить задачу
  const deleteTask = (taskId) => {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index === -1) return false

    tasks.value.splice(index, 1)
    saveTasks()
    return true
  }

  // Переместить задачу (изменение статуса)
  const moveTask = (taskId, newStatus, newPosition = null) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return false

    const oldStatus = task.status
    
    // Если статус не изменился, просто обновляем позицию
    if (oldStatus === newStatus && newPosition !== null) {
      const columnTasks = tasks.value.filter(t => t.status === newStatus)
      columnTasks.sort((a, b) => a.position - b.position)
      
      // Обновляем позиции всех задач в колонке
      columnTasks.forEach((t, index) => {
        if (t.id === taskId) {
          t.position = newPosition
        } else if (t.position >= newPosition) {
          t.position++
        }
      })
      
      saveTasks()
      return true
    }

    // Если статус изменился
    task.status = newStatus
    task.updatedAt = new Date()
    
    // Устанавливаем позицию в новой колонке
    const newColumnTasks = tasks.value.filter(t => t.status === newStatus && t.id !== taskId)
    task.position = newPosition !== null ? newPosition : newColumnTasks.length
    
    // Обновляем позиции в старой колонке
    const oldColumnTasks = tasks.value.filter(t => t.status === oldStatus)
    oldColumnTasks.forEach((t, index) => {
      t.position = index
    })
    
    // Обновляем позиции в новой колонке
    newColumnTasks.forEach((t, index) => {
      t.position = index < task.position ? index : index + 1
    })

    saveTasks()
    return true
  }

  // Получить задачи по статусу
  const getTasksByStatus = computed(() => {
    return (status) => {
      return tasks.value
        .filter(task => task.status === status)
        .sort((a, b) => a.position - b.position)
    }
  })

  // Получить статистику задач проекта
  const tasksStats = computed(() => {
    const total = tasks.value.length
    const backlog = tasks.value.filter(t => t.status === TASK_STATUSES.BACKLOG).length
    const inProgress = tasks.value.filter(t => t.status === TASK_STATUSES.IN_PROGRESS).length
    const done = tasks.value.filter(t => t.status === TASK_STATUSES.DONE).length
    
    return {
      total,
      backlog,
      inProgress,
      done,
      progress: total > 0 ? Math.round((done / total) * 100) : 0
    }
  })

  // Инициализация
  onMounted(() => {
    if (projectId) {
      loadProjectTasks()
    }
  })

  return {
    tasks,
    loading,
    error,
    loadProjectTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    tasksStats,
    saveTasks
  }
}