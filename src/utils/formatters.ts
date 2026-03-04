export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

export const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)

export const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
    new Date(value),
  )
