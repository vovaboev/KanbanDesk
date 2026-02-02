<!-- components/KanbanColumn.vue -->
<template>
  <div 
    class="kanban-column"
    :class="{ 'drag-over': isDragOver, [status]: true }"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="column-header">
      <div class="column-title">
        <span class="column-icon">{{ columnIcon }}</span>
        <h3 class="column-name">{{ columnName }}</h3>
        <span class="task-count">({{ tasks.length }})</span>
      </div>
      <button 
        v-if="showAddButton"
        @click="handleAddTask"
        class="add-task-btn"
        title="Добавить задачу"
      >
        +
      </button>
    </div>

    <div class="column-body" ref="columnBody">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading-tasks">
        <div class="small-spinner"></div>
      </div>

      <!-- Пустая колонка -->
      <div 
        v-else-if="tasks.length === 0" 
        class="empty-column"
        @dragover.prevent="handleEmptyDragOver"
        @drop="handleEmptyDrop"
      >
        <div class="empty-icon">{{ emptyIcon }}</div>
        <p class="empty-text">{{ emptyText }}</p>
        <button 
          v-if="showAddButton"
          @click="handleAddTask"
          class="add-first-task-btn"
        >
          + Добавить задачу
        </button>
      </div>

      <!-- Список задач -->
      <div 
        v-else
        class="tasks-list"
        :class="{ 'drag-over': isDragOver && tasks.length > 0 }"
      >
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @click="handleTaskClick(task)"
          @edit="handleTaskEdit(task)"
          @delete="handleTaskDelete(task.id)"
          @dragstart="handleTaskDragStart($event, task)"
          @drop="handleTaskDrop($event, task)"
        />
      </div>
    </div>

    <!-- Drop зона внизу колонки -->
    <div 
      v-if="isDragOver"
      class="drop-zone"
      @dragover.prevent
      @drop="handleBottomDrop"
    >
      <div class="drop-hint">
        <span class="drop-icon">↓</span>
        <span class="drop-text">Отпустите здесь</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TaskCard from './TaskCard.vue'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '../utils/constants'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => Object.values(TASK_STATUSES).includes(value)
  },
  tasks: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showAddButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'add-task', 
  'task-click', 
  'task-edit', 
  'task-delete',
  'task-move',
  'task-drop'
])

const isDragOver = ref(false)

const columnName = computed(() => {
  return TASK_STATUS_LABELS[props.status] || props.status
})

const columnIcon = computed(() => {
  const icons = {
    [TASK_STATUSES.BACKLOG]: '📋',
    [TASK_STATUSES.IN_PROGRESS]: '⚡',
    [TASK_STATUSES.DONE]: '✅'
  }
  return icons[props.status] || '📝'
})

const emptyIcon = computed(() => {
  const icons = {
    [TASK_STATUSES.BACKLOG]: '📭',
    [TASK_STATUSES.IN_PROGRESS]: '⏸️',
    [TASK_STATUSES.DONE]: '🎯'
  }
  return icons[props.status] || '📁'
})

const emptyText = computed(() => {
  const texts = {
    [TASK_STATUSES.BACKLOG]: 'Нет задач в бэклоге',
    [TASK_STATUSES.IN_PROGRESS]: 'Нет активных задач',
    [TASK_STATUSES.DONE]: 'Нет завершенных задач'
  }
  return texts[props.status] || 'Нет задач'
})

const handleAddTask = () => {
  emit('add-task', props.status)
}

const handleTaskClick = (task) => {
  emit('task-click', task)
}

const handleTaskEdit = (task) => {
  emit('task-edit', task)
}

const handleTaskDelete = (taskId) => {
  emit('task-delete', taskId)
}

const handleTaskDragStart = (event, task) => {
  emit('task-move', { event, task, fromStatus: props.status })
}

const handleTaskDrop = (event, dropOnTask) => {
  const taskId = event.dataTransfer.getData('text/plain')
  emit('task-drop', { 
    taskId, 
    dropOnTask, 
    toStatus: props.status,
    position: props.tasks.indexOf(dropOnTask)
  })
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const taskId = event.dataTransfer.getData('text/plain')
  emit('task-drop', { 
    taskId, 
    toStatus: props.status,
    position: props.tasks.length // В конец колонки
  })
}

const handleEmptyDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleEmptyDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const taskId = event.dataTransfer.getData('text/plain')
  emit('task-drop', { 
    taskId, 
    toStatus: props.status,
    position: 0 // Первая позиция в пустой колонке
  })
}

const handleBottomDrop = (event) => {
  event.preventDefault()
  
  const taskId = event.dataTransfer.getData('text/plain')
  emit('task-drop', { 
    taskId, 
    toStatus: props.status,
    position: props.tasks.length // В конец
  })
}
</script>

<style scoped>
.kanban-column {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.kanban-column.drag-over {
  border-color: #667eea;
  background: #edf2f7;
}

.kanban-column.backlog {
  border-top: 4px solid #667eea;
}

.kanban-column.in_progress {
  border-top: 4px solid #f39c12;
}

.kanban-column.done {
  border-top: 4px solid #27ae60;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.column-icon {
  font-size: 20px;
}

.column-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
}

.task-count {
  color: #718096;
  font-size: 14px;
  font-weight: 600;
}

.add-task-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-task-btn:hover {
  background: #5a67d8;
  transform: scale(1.1);
}

.column-body {
  flex: 1;
  min-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Стили скроллбара */
.column-body::-webkit-scrollbar {
  width: 6px;
}

.column-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.column-body::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.column-body::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.loading-tasks {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.small-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  padding: 20px;
  text-align: center;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: white;
  transition: all 0.2s;
  cursor: pointer;
}

.empty-column:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  color: #718096;
  font-size: 14px;
  margin-bottom: 16px;
  max-width: 200px;
}

.add-first-task-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-first-task-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tasks-list.drag-over {
  min-height: 100px;
}

.drop-zone {
  margin-top: 20px;
  padding: 20px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.drop-zone:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.drop-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  font-weight: 600;
}

.drop-icon {
  font-size: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .kanban-column {
    padding: 16px;
  }
  
  .column-name {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .kanban-column {
    min-height: 400px;
  }
  
  .column-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .add-task-btn {
    align-self: flex-end;
  }
}
</style>