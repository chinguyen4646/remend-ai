export interface User {
  id: number
  email: string
  fullName: string | null
}

export interface AuthResponse {
  user: User
  token: {
    type: string
    value: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  fullName?: string
}
