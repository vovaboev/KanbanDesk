<!-- components/TaskModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ editingTask ? 'Редактировать задачу' : 'Новая задача' }}</h2>
        <button @click="handleClose" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Название задачи *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Что нужно сделать?"
            class="form-input"
            :class="{ 'error': errors.title }"
          />
          <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Подробное описание..."
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Статус</label>
            <select 
              v-model="form.status" 
              class="form-select"
              :class="`status-${form.status}`"
            >
              <option 
                v-for="status in statusOptions" 
                :key="status.value"
                :value="status.value"
                :class="`status-${status.value}`"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Дедлайн</label>
            <input
              v-model="form.deadline"
              type="date"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Исполнитель</label>
          <input
            v-model="form.assignee"
            type="text"
            placeholder="Кто будет выполнять?"
            class="form-input"
          />
        </div>

        <div v-if="error" class="submit-error">
          {{ error }}
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleClose" class="btn btn-cancel">
          Отмена
        </button>
        <button @click="handleSave" class="btn btn-save" :disabled="!form.title.trim()">
          {{ editingTask ? 'Сохранить' : 'Создать' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { 
  TASK_STATUSES, 
  TASK_STATUS_LABELS 
} from '../utils/constants'
import { formatDateForInput } from '../utils/helpers'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  editingTask: {
    type: Object,
    default: null
  },
  currentStatus: {
    type: String,
    default: TASK_STATUSES.BACKLOG
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  title: '',
  description: '',
  status: TASK_STATUSES.BACKLOG,
  deadline: '',
  assignee: ''
})

const errors = ref({})
const error = ref('')

const statusOptions = computed(() => {
  return Object.values(TASK_STATUSES).map(status => ({
    value: status,
    label: TASK_STATUS_LABELS[status]
  }))
})

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSave = () => {
  if (!validateForm()) return

  const taskData = {
    ...form.value,
    title: form.value.title.trim(),
    description: form.value.description?.trim() || '',
    assignee: form.value.assignee?.trim() || '',
    deadline: form.value.deadline || null
  }

  emit('save', taskData)
  resetForm()
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Введите название задачи'
    return false
  }
  
  return true
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    status: props.currentStatus,
    deadline: '',
    assignee: ''
  }
  errors.value = {}
  error.value = ''
}

// Заполняем форму при редактировании
watch(() => props.editingTask, (task) => {
  if (task) {
    form.value = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      deadline: task.deadline ? formatDateForInput(task.deadline) : '',
      assignee: task.assignee || ''
    }
  }
})

// Сброс формы при открытии модалки
watch(() => props.show, (show) => {
  if (show && !props.editingTask) {
    form.value.status = props.currentStatus
  }
  if (!show) {
    resetForm()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

/* Цвета для статусов в селекте */
.form-select.status-backlog {
  border-left: 4px solid #667eea;
}

.form-select.status-in_progress {
  border-left: 4px solid #f39c12;
}

.form-select.status-done {
  border-left: 4px solid #27ae60;
}

option.status-backlog {
  color: #667eea;
}

option.status-in_progress {
  color: #f39c12;
}

option.status-done {
  color: #27ae60;
}

.error-message {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.submit-error {
  background: #fff5f5;
  color: #e53e3e;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
  border-left: 4px solid #e53e3e;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-cancel {
  background: #718096;
  color: white;
}

.btn-cancel:hover {
  background: #4a5568;
}

.btn-save {
  background: #667eea;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 640px) {
  .modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .btn {
    padding: 10px 20px;
    min-width: 80px;
  }
}
</style>