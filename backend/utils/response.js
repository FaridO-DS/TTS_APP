export const successResponse = (message, data = null) => ({
  success: true,
  message,
  data,
  error: null,
})

export const errorResponse = (message, error = null) => ({
  success: false,
  message,
  data: null,
  error,
})
