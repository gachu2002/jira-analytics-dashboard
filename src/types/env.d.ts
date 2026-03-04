interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_TOKEN_URL: string
  readonly VITE_USE_MOCK_AUTH: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
