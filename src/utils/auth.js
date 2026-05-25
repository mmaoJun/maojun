export const TOKEN_KEY = 'admin-jwt-token'
export const USERNAME_KEY = 'admin-username'

export const getToken = () => localStorage.getItem(TOKEN_KEY) || ''

export const setAuth = ({ token, username }) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

export const getUsername = () => localStorage.getItem(USERNAME_KEY) || ''

export const isAuthenticated = () => Boolean(getToken())
