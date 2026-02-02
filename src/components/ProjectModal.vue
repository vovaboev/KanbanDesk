<!-- components/ProjectModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ editingProject ? 'Редактировать проект' : 'Новый проект' }}</h2>
        <button @click="handleClose" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Название проекта *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Название проекта"
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
            placeholder="Описание проекта..."
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Цвет проекта</label>
          <div class="color-picker">
            <div
              v-for="color in projectColors"
              :key="color"
              class="color-option"
              :style="{ backgroundColor: color }"
              :class="{ selected: form.color === color }"
              @click="form.color = color"
            >
              <span v-if="form.color === color" class="check-icon">✓</span>
            </div>
          </div>
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
          {{ editingProject ? 'Сохранить' : 'Создать' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { PROJECT_COLORS, DEFAULT_PROJECT_COLOR } from '../utils/constants'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  editingProject: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  title: '',
  description: '',
  color: DEFAULT_PROJECT_COLOR
})

const errors = ref({})
const error = ref('')
const projectColors = PROJECT_COLORS

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSave = () => {
  if (!validateForm()) return

  emit('save', {
    ...form.value,
    title: form.value.title.trim()
  })
  
  resetForm()
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Введите название проекта'
    return false
  }
  
  return true
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    color: DEFAULT_PROJECT_COLOR
  }
  errors.value = {}
  error.value = ''
}

// Заполняем форму при редактировании
watch(() => props.editingProject, (project) => {
  if (project) {
    form.value = {
      title: project.title,
      description: project.description || '',
      color: project.color || DEFAULT_PROJECT_COLOR
    }
  }
})

// Сброс формы при открытии модалки
watch(() => props.show, (show) => {
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
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

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
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.form-input.error:focus {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #2d3748;
  transform: scale(1.1);
}

.check-icon {
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
  
  .btn {
    padding: 10px 20px;
    min-width: 80px;
  }
}
</style>