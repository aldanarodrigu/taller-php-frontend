export interface NotificationData {
  titulo: string
  mensaje: string
  [key: string]: unknown
}

export interface Notification {
  id: string
  type: string
  notifiable_type: string
  notifiable_id: number
  data: NotificationData
  read_at: string | null
  created_at: string
  updated_at: string
}
