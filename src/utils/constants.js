// utils/constants.js
export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
}

export const TASK_STATUSES = {
  BACKLOG: 'backlog',
  IN_PROGRESS: 'in_progress',
  DONE: 'done'
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.BACKLOG]: 'Backlog',
  [TASK_STATUSES.IN_PROGRESS]: 'В работе',
  [TASK_STATUSES.DONE]: 'Готово'
}

export const TASK_STATUS_COLORS = {
  [TASK_STATUSES.BACKLOG]: '#667eea',
  [TASK_STATUSES.IN_PROGRESS]: '#f39c12',
  [TASK_STATUSES.DONE]: '#27ae60'
}

export const PROJECT_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe',
  '#43e97b', '#38f9d7', '#fa709a', '#fee140',
  '#a8edea', '#fed6e3', '#ff9a9e', '#fad0c4'
]

export const DEFAULT_PROJECT_COLOR = '#667eea'