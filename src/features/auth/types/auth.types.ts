export type LoginRequest = {
  username: string
  password: string
}

export type TokenPair = {
  access: string
  refresh: string
}

export type RefreshAccessRequest = {
  refresh: string
}

export type RefreshAccessResponse = {
  access: string
}

export type AuthSession = {
  username: string
  accessToken: string
  refreshToken: string
}
