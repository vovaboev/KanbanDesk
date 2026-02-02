<!-- components/ProjectCard.vue (часть template) -->
<template>
  <div 
    class="project-card"
    :style="{ borderColor: project.color }"
    @click="handleClick"
  >
    <div class="project-card-header">
      <div class="project-color" :style="{ backgroundColor: project.color }"></div>
      <div class="project-title-wrapper">
        <h3 class="project-title" :title="project.title">
          {{ project.title }}
        </h3>
        <div class="project-task-count">
          <span class="count-number">{{ project.taskCount || 0 }}</span>
          <span class="count-label">tasks</span>
        </div>
      </div>
      
      <div class="project-actions">
        <button 
          @click.stop="handleEdit"
          class="project-action-btn edit-btn"
          title="Редактировать"
        >
          ✏️
        </button>
        <button 
          @click.stop="handleDelete"
          class="project-action-btn delete-btn"
          title="Удалить"
        >
          ×
        </button>
      </div>
    </div>

    <div v-if="project.description" class="project-description">
      {{ project.description }}
    </div>

    <div class="project-meta">
      <div class="project-date">
        <span class="date-icon">📅</span>
        <span class="date-text">{{ formatDate(project.updatedAt) }}</span>
      </div>
      
      <div class="project-status">
        <span class="status-dot" :class="{ archived: isArchived }"></span>
        <span class="status-text">{{ isArchived ? 'Архив' : 'Активен' }}</span>
      </div>
    </div>

    <div class="project-footer">
      <button class="open-project-btn">
        Открыть проект →
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { formatDate } from '../utils/helpers'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'edit', 'delete'])

const isArchived = computed(() => props.project.status === 'archived')

const handleClick = () => {
  emit('click', props.project)
}

const handleEdit = (e) => {
  e.stopPropagation()
  emit('edit', props.project)
}

const handleDelete = (e) => {
  e.stopPropagation()
  if (confirm(`Удалить проект "${props.project.title}"?`)) {
    emit('delete', props.project.id)
  }
}
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 6px solid;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.project-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.project-color {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.project-title-wrapper {
  flex: 1;
  min-width: 0;
}

.project-title {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.project-task-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f7fafc;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
}

.count-number {
  font-weight: 700;
  color: #4a5568;
}

.count-label {
  color: #718096;
}

.project-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.project-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  background: transparent;
}

.edit-btn {
  color: #4a5568;
  background: #f7fafc;
}

.edit-btn:hover {
  background: #edf2f7;
  transform: scale(1.05);
}

.delete-btn {
  color: #e53e3e;
  background: #fff5f5;
  font-weight: bold;
  font-size: 18px;
}

.delete-btn:hover {
  background: #fed7d7;
  transform: scale(1.05);
}

.project-description {
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex: 1;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.project-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #718096;
}

.date-icon {
  font-size: 14px;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38a169;
}

.status-dot.archived {
  background: #a0aec0;
}

.status-text {
  font-size: 13px;
  color: #718096;
}

.project-footer {
  margin-top: auto;
}

.open-project-btn {
  width: 100%;
  padding: 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.open-project-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  color: #2d3748;
}

/* Адаптивность */
@media (max-width: 768px) {
  .project-card {
    padding: 20px;
  }
  
  .project-title {
    font-size: 16px;
  }
  
  .project-actions {
    flex-direction: column;
  }
  
  .project-action-btn {
    width: 28px;
    height: 28px;
  }
}
</style>