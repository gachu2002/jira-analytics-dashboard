export type AuthUser = {
  id: string
  username: string
}

export type LoginPayload = {
  username: string
  password: string
}

export type AuthTokens = {
  refresh: string
  access: string
}
