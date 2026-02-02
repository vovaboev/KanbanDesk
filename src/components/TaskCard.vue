<!-- components/TaskCard.vue -->
<template>
  <div 
    class="task-card"
    :class="[`status-${task.status}`, { 'drag-over': isDragOver }]"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="handleClick"
  >
    <div class="task-card-header">
      <h4 class="task-title" :title="task.title">
        {{ task.title }}
      </h4>
      <div class="task-actions">
        <button 
          @click.stop="handleEdit"
          class="task-action-btn edit-btn"
          title="Редактировать"
        >
          ✏️
        </button>
        <button 
          @click.stop="handleDelete"
          class="task-action-btn delete-btn"
          title="Удалить"
        >
          ×
        </button>
      </div>
    </div>

    <div v-if="task.description" class="task-description">
      {{ task.description }}
    </div>

    <div class="task-meta">
      <!-- Дедлайн -->
      <div v-if="task.deadline" class="deadline-info" :class="deadlineStatus">
        <span class="deadline-icon">📅</span>
        <span class="deadline-date">{{ formatDate(task.deadline) }}</span>
        <span v-if="deadlineText" class="deadline-alert">
          {{ deadlineText }}
        </span>
      </div>

      <!-- Исполнитель -->
      <div v-if="task.assignee" class="assignee-info">
        <span class="assignee-icon">👤</span>
        <span class="assignee-name">{{ task.assignee }}</span>
      </div>
    </div>

    <div class="task-footer">
      <div class="task-status-badge">
        {{ statusLabel }}
      </div>
      <div class="drag-handle" title="Перетащите для перемещения">
        ☰
      </div>
    </div>

    <!-- Хинт при перетаскивании -->
    <div v-if="isDragOver" class="drop-hint">
      Отпустите здесь
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  formatDate, 
  getDeadlineStatus 
} from '../utils/helpers'
import { 
  TASK_STATUS_LABELS 
} from '../utils/constants'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'edit', 'delete', 'dragstart', 'drop'])

const isDragOver = ref(false)

const statusLabel = computed(() => {
  return TASK_STATUS_LABELS[props.task.status] || props.task.status
})

const deadlineStatus = computed(() => {
  if (!props.task.deadline) return null
  return getDeadlineStatus(props.task.deadline)
})

const deadlineText = computed(() => {
  const status = deadlineStatus.value
  const texts = {
    overdue: 'Просрочено',
    today: 'Сегодня',
    soon: 'Скоро'
  }
  return texts[status] || ''
})

const handleDragStart = (event) => {
  emit('dragstart', event, props.task)
  event.dataTransfer.setData('text/plain', props.task.id)
}

const handleDragOver = (event) => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  emit('drop', event, props.task)
}

const handleClick = () => {
  emit('click', props.task)
}

const handleEdit = (e) => {
  e.stopPropagation()
  emit('edit', props.task)
}

const handleDelete = (e) => {
  e.stopPropagation()
  if (confirm(`Удалить задачу "${props.task.title}"?`)) {
    emit('delete', props.task.id)
  }
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  position: relative;
  user-select: none;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.drag-over {
  border-color: #667eea;
  background: #f7fafc;
  transform: scale(1.02);
}

.task-card.status-backlog {
  border-left: 4px solid #667eea;
}

.task-card.status-in_progress {
  border-left: 4px solid #f39c12;
}

.task-card.status-done {
  border-left: 4px solid #27ae60;
  opacity: 0.9;
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.task-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.task-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.task-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  background: transparent;
  opacity: 0.7;
}

.task-action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.edit-btn {
  color: #4a5568;
  background: #f7fafc;
}

.delete-btn {
  color: #e53e3e;
  background: #fff5f5;
  font-weight: bold;
  font-size: 16px;
}

.task-description {
  color: #718096;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.deadline-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f7fafc;
}

.deadline-info.overdue {
  background: #fff5f5;
  color: #e53e3e;
}

.deadline-info.today {
  background: #fffaf0;
  color: #d69e2e;
}

.deadline-info.soon {
  background: #ebf8ff;
  color: #3182ce;
}

.deadline-icon {
  font-size: 12px;
}

.deadline-date {
  flex: 1;
}

.deadline-alert {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #718096;
  padding: 6px 10px;
  background: #f7fafc;
  border-radius: 8px;
}

.assignee-icon {
  font-size: 12px;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.task-status-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
}

.drag-handle {
  color: #a0aec0;
  font-size: 16px;
  cursor: grab;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.drag-handle:hover {
  background: #edf2f7;
  color: #718096;
}

.drop-hint {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  border-radius: 10px;
  animation: pulse 1.5s infinite;
  z-index: 1;
}

@keyframes pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}

/* Адаптивность */
@media (max-width: 768px) {
  .task-card {
    padding: 14px;
  }
  
  .task-title {
    font-size: 14px;
  }
  
  .task-actions {
    flex-direction: column;
  }
  
  .task-action-btn {
    width: 24px;
    height: 24px;
  }
}
</style>