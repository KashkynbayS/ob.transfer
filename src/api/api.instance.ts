import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'; // Define the type for your token
import { requestTokenExpiredInterceptor } from './interceptors/request-token-expired';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://dev-api.kmf.kz'
const LS_TOKEN_KEY = 'accessToken'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean
	retryCount?: number
}

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MTIyMjYxMjYsImlhdCI6MTcxMjIyNTIyNiwianRpIjoiMWQ1ZDIxOGMtYjZhZS00OGFiLWFiZGQtZGU3Yzg0ZWYwY2YyIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjQyNmIwZTQyLTAxMjktNDY1MC05N2ZlLTUxZDI2OWE5ODVmNCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiYzMzMDIzNDAtZmFjMy00MGY2LWE1YjctNzE3OWZlYjc2NjNkIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImMzMzAyMzQwLWZhYzMtNDBmNi1hNWI3LTcxNzlmZWI3NjYzZCIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQmNCh0JzQkNCY0Jsg0JguIiwicGhvbmUiOiIrNzc3NjY2NjU5NDciLCJpaW4iOiIwMTExMTQ1MDA1MjIiLCJhdmF0YXIiOiIzNGIwNmU5Yi03NzI4LTQzZmMtOTg5Mi03MjEyYTMyYTA5NTQiLCJzY29wZSI6WyJpbnRlcm5hbCIsImJhc2ljIl19LCJjb2x2aXIiOnsiaWQiOjE0MTEzNzc5LCJkZXBJZCI6NzMzLCJjb2RlIjoiMDAwMDAxMzU5OTI0In0sInR5cGVJZCI6MX19.YK9pwzA5FxrnKxcyohy2Dur9iVaWxIIpFjjawxHhgbbZM2lf2zigEbEr59jquZ0J1FDz9ePoFlNj0UHRM__9tbSoqtDp1uaIonzAFFg84hPV050qkyvwX4mUUsk_XGf4dn60286lj0LbgOmhRVUuEb_Y7uQFg1I55q-psK-RL1V-OkfoNKrcuDNWDSSP-sNO5x9Wdc9_TSIgJu38-HH5HjVqvDKMowvvGg3OJ_EEgpxazEUTjFHyHZ9VcFHlhESZb-5-t7Hef7-p-j22xIrB5IAQaNhBOQJ2HUPBgzLELX9o0CPj_rA0qx_tSrH8eeWCfy85fO0gadjxj_UpdgmLWQ'
	)
}

const refreshToken = async () => {
	const url = `${BASE_URL}/api/bank/sso/internal/customer/authorize`
	const formData = {
		phone: '+77081991418',
		password: 'Qwerty123'
	}

	return fetch(url, {
		method: 'POST',
		body: JSON.stringify(formData)
	}).then((response) => response.json())
}

const getAccessToken = (): string => `Bearer ${sessionStorage.getItem(LS_TOKEN_KEY) || ''}`

type ErrorHandler = (error: AxiosError, axiosInstance: AxiosInstance) => Promise<AxiosResponse | void>
const handleTokenExpiry: ErrorHandler = async (error, axiosInstance) => {
	if (import.meta.env.VITE_ENVIRONMENT !== 'local') {
		return
	}

	const originalRequest = error.config as CustomAxiosRequestConfig
	if (originalRequest && originalRequest.headers && error.response && error.response.status === 401) {
		originalRequest._retry = true
		originalRequest.retryCount = originalRequest.retryCount || 0

		if (originalRequest.retryCount >= 2) {
			return Promise.reject(error)
		}

		originalRequest.retryCount++

		try {
			const token = await refreshToken()
			sessionStorage.setItem(LS_TOKEN_KEY, (token as any)?.data.access)
			return axiosInstance.request(originalRequest)
		} catch (e) {
			console.log('refresh token error', e)
			return Promise.reject(error)
		}
	}

	return Promise.reject(error)
}

const language = 'RU'

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	headers: {
		Authorization: getAccessToken(),
		Lng: `${language}`
	}
})

axiosInstance.interceptors.request.use((config) => {
	config.headers['Authorization'] = getAccessToken()

	return config
})

axiosInstance.interceptors.response.use(
	(response) => {
		return response
	},

)

axiosInstance.interceptors.request.use(requestTokenExpiredInterceptor)

export default axiosInstance
