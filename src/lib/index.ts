export { authService } from './auth'
export { firestoreService, where } from './firestore'
export { cn } from './utils'
export {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateRequired,
} from './validation'
export type { ValidationRule } from './validation'

// Services
export { dashboardService } from './dashboardService'
export { chatService } from './chatService'
export type { ChatUser, ChatMessage, ChatSession, FriendRequest, Friendship } from './chatService'
export { queueService } from './queueService'
export { organizationService, inviteService } from './organizationService'
export { userService } from './userService'
