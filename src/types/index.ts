export interface Task {
  id: number
  service_id: number
  label: string
  description: string | null
  url: string | null
  sort_order: number
  completed: boolean
}

export interface Service {
  id: number
  name: string
  category: 'email' | 'social' | 'dev' | 'financial' | 'custom'
  sort_order: number
  is_builtin: number
  tasks: Task[]
}
