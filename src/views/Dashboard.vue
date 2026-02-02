<!-- views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1>Мои проекты</h1>
          <div class="header-stats" v-if="projectsStats">
            <span class="stat-item">
              <span class="stat-number">{{ projectsStats.totalProjects }}</span>
              <span class="stat-label">проектов</span>
            </span>
            <span class="stat-item">
              <span class="stat-number">{{ projectsStats.totalTasks }}</span>
              <span class="stat-label">задач</span>
            </span>
          </div>
        </div>

        <div class="header-right">
          <div class="user-section">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ authStore.user?.login || 'Гость' }}</span>
            </div>
            <button @click="handleLogout" class="logout-btn">
              Выйти
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Действия -->
        <div class="actions-bar">
          <button @click="showCreateModal" class="create-project-btn">
            <span class="btn-icon">+</span>
            Создать проект
          </button>
          
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск проектов..."
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка проектов...</p>
        </div>

        <!-- Состояние ошибки -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Ошибка загрузки</h3>
          <p>{{ error }}</p>
          <button @click="loadProjects" class="retry-btn">
            Попробовать снова
          </button>
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="filteredProjects.length === 0" class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">📁</div>
            <h3>Нет проектов</h3>
            <p v-if="searchQuery">Не найдено проектов по запросу "{{ searchQuery }}"</p>
            <p v-else>Создайте свой первый проект!</p>
            <button @click="showCreateModal" class="create-first-btn">
              + Создать проект
            </button>
          </div>
        </div>

        <!-- Список проектов -->
        <div v-else class="projects-grid">
          <ProjectCard
            v-for="project in filteredProjects"
            :key="project.id"
            :project="project"
            @click="openProject(project)"
            @edit="editProject(project)"
            @delete="handleDeleteProject"
          />
        </div>

        <!-- Модалка проекта -->
        <ProjectModal
          v-if="showModal"
          :show="showModal"
          :editingProject="editingProject"
          @close="closeModal"
          @save="handleProjectSave"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import useProjects from '../composables/useProjects'
import ProjectCard from '../components/ProjectCard.vue'
import ProjectModal from '../components/ProjectModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const {
  projects,
  loading,
  error,
  createProject,
  updateProject,
  deleteProject, // импортируем deleteProject из useProjects
  projectsStats,
  loadProjects
} = useProjects()

const showModal = ref(false)
const editingProject = ref(null)
const searchQuery = ref('')

// Фильтруем проекты по поисковому запросу
const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) return projects.value
  
  const query = searchQuery.value.toLowerCase().trim()
  return projects.value.filter(project => 
    project.title.toLowerCase().includes(query) ||
    (project.description && project.description.toLowerCase().includes(query))
  )
})

// Открытие проекта
const openProject = (project) => {
  router.push(`/project/${project.id}`)
}

// Создание проекта
const showCreateModal = () => {
  editingProject.value = null
  showModal.value = true
}

// Редактирование проекта
const editProject = (project) => {
  editingProject.value = project
  showModal.value = true
}

// Закрытие модалки
const closeModal = () => {
  showModal.value = false
  editingProject.value = null
}

// Сохранение проекта
const handleProjectSave = (projectData) => {
  if (editingProject.value) {
    // Обновление существующего проекта
    updateProject(editingProject.value.id, projectData)
  } else {
    // Создание нового проекта
    createProject(projectData)
  }
  closeModal()
}

// Удаление проекта - ПЕРЕИМЕНОВЫВАЕМ ФУНКЦИЮ
const handleDeleteProject = (projectId) => {
  if (confirm('Удалить проект и все его задачи?')) {
    deleteProject(projectId) // вызываем функцию из useProjects
  }
}

// Выход из системы
const handleLogout = () => {
  if (confirm('Выйти из системы?')) {
    authStore.logout()
    router.push('/login')
  }
}

// Инициализация
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header */
.header {
  background: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-left h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #718096;
}

.stat-number {
  font-weight: 700;
  color: #4a5568;
}

.stat-label {
  color: #a0aec0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f7fafc;
  padding: 8px 16px;
  border-radius: 20px;
}

.user-avatar {
  font-size: 16px;
}

.user-name {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.logout-btn {
  background: #fed7d7;
  color: #c53030;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #feb2b2;
  transform: translateY(-1px);
}

/* Main Content */
.main-content {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.container {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

/* Actions Bar */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
}

.create-project-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.create-project-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.create-project-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 20px;
  font-weight: 700;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 14px 20px 14px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
  pointer-events: none;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.error-state h3,
.empty-state h3 {
  font-size: 24px;
  color: #2d3748;
  margin-bottom: 10px;
}

.error-state p,
.empty-state p {
  color: #718096;
  font-size: 16px;
  max-width: 400px;
  margin: 0 auto 20px;
  line-height: 1.5;
}

.retry-btn,
.create-first-btn {
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

.retry-btn:hover,
.create-first-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left {
    text-align: center;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .main-content {
    padding: 24px 16px;
  }
  
  .container {
    padding: 24px;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 16px 0;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .header-left h1 {
    font-size: 24px;
  }
  
  .user-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .main-content {
    padding: 20px 12px;
  }
  
  .container {
    padding: 20px;
  }
}
</style>