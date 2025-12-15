import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    // Rutas públicas que no requieren token
    const publicRoutes = [
      { url: '/login', method: 'post' },
      { url: '/user', method: 'post' },
      { url: '/user/newpassword', method: 'post' },
    ]

    // Normalizar URL para asegurar que empiece con /
    const url = config.url.startsWith('/') ? config.url : `/${config.url}`
    const method = config.method.toLowerCase()

    const isPublic = publicRoutes.some(
      (route) => route.url === url && route.method === method,
    )

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
