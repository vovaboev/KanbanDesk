<!-- views/ProjectView.vue -->
<template>
  <div class="project-view">
    <!-- Заголовок проекта -->
    <header class="project-header" :style="{ backgroundColor: project?.color || '#667eea' }">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-btn" title="Назад к проектам">
            ←
          </button>
          <div class="project-info">
            <h1 class="project-title">{{ project?.title || 'Загрузка...' }}</h1>
            <p v-if="project?.description" class="project-description">
              {{ project.description }}
            </p>
            <div class="project-stats">
              <span class="stat-item">
                <span class="stat-icon">📋</span>
                <span class="stat-value">{{ tasksStats.total || 0 }}</span>
                <span class="stat-label">всего</span>
              </span>
              <span class="stat-item">
                <span class="stat-icon">⚡</span>
                <span class="stat-value">{{ tasksStats.inProgress || 0 }}</span>
                <span class="stat-label">в работе</span>
              </span>
              <span class="stat-item">
                <span class="stat-icon">✅</span>
                <span class="stat-value">{{ tasksStats.done || 0 }}</span>
                <span class="stat-label">готово</span>
              </span>
              <span class="stat-item progress">
                <span class="stat-value">{{ tasksStats.progress || 0 }}%</span>
                <span class="stat-label">прогресс</span>
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="header-actions">
            <button @click="handleEditProject" class="header-btn edit-btn" title="Редактировать проект">
              ✏️
            </button>
            <button @click="handleAddTask" class="header-btn add-btn">
              + Новая задача
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="project-main">
      <div class="container">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-board">
          <div class="spinner"></div>
          <p>Загрузка задач...</p>
        </div>

        <!-- Состояние ошибки -->
        <div v-else-if="error" class="error-board">
          <div class="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="loadTasks" class="retry-btn">
            Попробовать снова
          </button>
        </div>

        <!-- Канбан доска -->
        <div v-else class="kanban-board">
          <KanbanColumn
            :status="TASK_STATUSES.BACKLOG"
            :tasks="backlogTasks"
            :loading="loading"
            @add-task="handleAddTaskWithStatus(TASK_STATUSES.BACKLOG)"
            @task-click="handleTaskClick"
            @task-edit="handleEditTask"
            @task-delete="handleDeleteTask"
            @task-move="handleTaskMove"
            @task-drop="handleTaskDrop"
          />

          <KanbanColumn
            :status="TASK_STATUSES.IN_PROGRESS"
            :tasks="inProgressTasks"
            :loading="loading"
            @add-task="handleAddTaskWithStatus(TASK_STATUSES.IN_PROGRESS)"
            @task-click="handleTaskClick"
            @task-edit="handleEditTask"
            @task-delete="handleDeleteTask"
            @task-move="handleTaskMove"
            @task-drop="handleTaskDrop"
          />

          <KanbanColumn
            :status="TASK_STATUSES.DONE"
            :tasks="doneTasks"
            :loading="loading"
            @add-task="handleAddTaskWithStatus(TASK_STATUSES.DONE)"
            @task-click="handleTaskClick"
            @task-edit="handleEditTask"
            @task-delete="handleDeleteTask"
            @task-move="handleTaskMove"
            @task-drop="handleTaskDrop"
          />
        </div>
      </div>
    </main>

    <!-- Overlay для перетаскивания -->
    <div v-if="isDragging" class="drag-overlay">
      Перетаскивается: <strong>{{ draggedTask?.title }}</strong>
      <div class="drag-instructions">
        Перетащите в другую колонку для изменения статуса
      </div>
    </div>

    <!-- Модалки -->
    <ProjectModal
      v-if="showProjectModal"
      :show="showProjectModal"
      :editingProject="editingProject"
      @close="closeProjectModal"
      @save="handleProjectSave"
    />

    <TaskModal
      v-if="showTaskModal"
      :show="showTaskModal"
      :editingTask="editingTask"
      :currentStatus="taskModalStatus"
      @close="closeTaskModal"
      @save="handleTaskSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import useProjects from '../composables/useProjects'
import useTasks from '../composables/useTasks'
import { TASK_STATUSES } from '../utils/constants'
import KanbanColumn from '../components/KanbanColumn.vue'
import TaskModal from '../components/TaskModal.vue'
import ProjectModal from '../components/ProjectModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const projectId = ref(route.params.id)
const project = ref(null)
const showProjectModal = ref(false)
const showTaskModal = ref(false)
const editingProject = ref(null)
const editingTask = ref(null)
const taskModalStatus = ref(TASK_STATUSES.BACKLOG)
const isDragging = ref(false)
const draggedTask = ref(null)

// Используем useProjects для получения проекта
const { 
  projects, 
  getProjectById, 
  updateProject,
  updateTaskCount 
} = useProjects()

// Используем useTasks для работы с задачами - ПРОБЛЕМА БЫЛА ЗДЕСЬ
const { 
  tasks, 
  loading, 
  error,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  loadProjectTasks,
  tasksStats
} = useTasks(projectId.value) // Передаем projectId как строку

// Задачи по статусам
const backlogTasks = computed(() => {
  return tasks.value.filter(task => task.status === TASK_STATUSES.BACKLOG)
})

const inProgressTasks = computed(() => {
  return tasks.value.filter(task => task.status === TASK_STATUSES.IN_PROGRESS)
})

const doneTasks = computed(() => {
  return tasks.value.filter(task => task.status === TASK_STATUSES.DONE)
})

// Загрузка проекта и задач
const loadProject = () => {
  project.value = getProjectById(projectId.value)
  if (project.value) {
    loadTasks()
  }
}

// Загрузка задач
const loadTasks = () => {
  if (projectId.value) {
    loadProjectTasks()
  }
}

// Навигация
const goBack = () => {
  router.push('/dashboard')
}

// Управление проектом
const handleEditProject = () => {
  editingProject.value = project.value
  showProjectModal.value = true
}

const closeProjectModal = () => {
  showProjectModal.value = false
  editingProject.value = null
}

const handleProjectSave = (projectData) => {
  if (project.value) {
    updateProject(project.value.id, projectData)
    project.value = { ...project.value, ...projectData }
  }
  closeProjectModal()
}

// Управление задачами
const handleAddTask = () => {
  editingTask.value = null
  taskModalStatus.value = TASK_STATUSES.BACKLOG
  showTaskModal.value = true
}

const handleAddTaskWithStatus = (status) => {
  editingTask.value = null
  taskModalStatus.value = status
  showTaskModal.value = true
}

const handleTaskClick = (task) => {
  editingTask.value = task
  showTaskModal.value = true
}

const handleEditTask = (task) => {
  editingTask.value = task
  showTaskModal.value = true
}

const handleDeleteTask = (taskId) => {
  deleteTask(taskId)
}

const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
}

// ИСПРАВЛЯЕМ ЭТУ ФУНКЦИЮ - УБИРАЕМ ЛИШНИЙ ПАРАМЕТР
const handleTaskSave = (taskData) => {
  if (editingTask.value) {
    // Обновление существующей задачи
    updateTask(editingTask.value.id, taskData)
  } else {
    // Создание новой задачи - НЕ ПЕРЕДАЕМ projectId
    createTask(taskData)
    
    // Обновляем счетчик задач в проекте
    if (project.value) {
      updateTaskCount(project.value.id, tasks.value.length + 1)
    }
  }
  closeTaskModal()
}

// Drag & Drop
const handleTaskMove = ({ event, task, fromStatus }) => {
  isDragging.value = true
  draggedTask.value = task
  event.dataTransfer.setData('text/plain', task.id)
}

const handleTaskDrop = ({ taskId, dropOnTask, toStatus, position }) => {
  moveTask(taskId, toStatus, position)
  isDragging.value = false
  draggedTask.value = null
}

// Инициализация
onMounted(() => {
  loadProject()
})

// Следим за изменением ID проекта
watch(() => route.params.id, (newId) => {
  if (newId) {
    projectId.value = newId
    loadProject()
  }
})

// Следим за изменением списка проектов
watch(() => projects.value, () => {
  if (projectId.value) {
    loadProject()
  }
}, { deep: true })
</script>

<style scoped>
/* Весь стиль остается без изменений как в исходном файле */
.project-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.project-header {
  background: linear-gradient(135deg, var(--project-color) 0%, rgba(0,0,0,0.2) 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  backdrop-filter: blur(5px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.project-info {
  flex: 1;
}

.project-title {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.project-description {
  margin: 0 0 20px 0;
  font-size: 16px;
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.5;
}

.project-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item.progress {
  background: rgba(39, 174, 96, 0.7);
}

.stat-icon {
  font-size: 16px;
}

.stat-value {
  font-weight: 700;
  font-size: 16px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  min-width: 44px;
  padding: 12px;
  backdrop-filter: blur(5px);
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.add-btn {
  background: white;
  color: #2d3748;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.add-btn:hover {
  background: #f7fafc;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.project-main {
  padding: 40px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.container {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.loading-board,
.error-board {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.error-board h3 {
  font-size: 24px;
  color: #2d3748;
  margin-bottom: 10px;
}

.error-board p {
  color: #718096;
  font-size: 16px;
  max-width: 400px;
  margin: 0 auto 20px;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  min-height: 600px;
}

.drag-overlay {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 15px 25px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 300px;
  animation: slideUp 0.3s ease;
}

.drag-instructions {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 5px;
  font-style: italic;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (max-width: 1200px) {
  .kanban-board {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .header-actions {
    justify-content: flex-end;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .project-header {
    padding: 16px 0;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .project-title {
    font-size: 24px;
  }
  
  .project-stats {
    gap: 10px;
  }
  
  .stat-item {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-btn {
    width: 100%;
    justify-content: center;
  }
  
  .project-main {
    padding: 24px 16px;
  }
  
  .container {
    padding: 24px;
  }
  
  .drag-overlay {
    width: 90%;
    min-width: auto;
    bottom: 10px;
    font-size: 12px;
    padding: 10px 15px;
  }
}

@media (max-width: 480px) {
  .header-left {
    flex-direction: column;
    gap: 15px;
  }
  
  .back-btn {
    align-self: flex-start;
  }
  
  .project-stats {
    justify-content: center;
  }
  
  .stat-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>