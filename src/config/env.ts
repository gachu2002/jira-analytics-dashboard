const requiredEnv = {
  appName: import.meta.env.VITE_APP_NAME || 'Jira Analytics Dashboard',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
}

export const env = requiredEnv
