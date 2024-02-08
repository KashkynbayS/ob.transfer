import { tokenExpired } from '@ui-kit/events'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios' // Define the type for your token

const LS_TOKEN_KEY = 'accessToken'
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean
	retryCount?: number
}

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDUwMzQ0NDEsImlhdCI6MTcwNTAzMzU0MSwianRpIjoiMzNjNTUwZWItOTM3NS00ODlhLWJhMWEtZTk4ZTdkNmM2NjI0IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImI3YWNiMTkxLTEzMWUtNDU0Ny1hODc1LWM1NDI1M2JjODQxMCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiZDhmMjZmNWYtNWJhNS00ZmVjLTk1MzUtYWFlOGI5M2EzZWUxIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImQ4ZjI2ZjVmLTViYTUtNGZlYy05NTM1LWFhZThiOTNhM2VlMSIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTQiLCJicmFuY2hJZCI6IjE0QSIsIm5hbWUiOiLQmNCh0JzQkNCY0Jsg0JguIiwicGhvbmUiOiIrNzc3NjY2NjU5NDciLCJpaW4iOiIwMTExMTQ1MDA1MjIiLCJhdmF0YXIiOiI5ODk3ODkyZC03N2ZlLTRiYzUtOGE2OC1jZWIxNmY1YTkwYTciLCJzY29wZSI6e30sImNvbnNlbnQiOnsiYmFzaWMiOmZhbHNlLCJleHRlbmRlZCI6ZmFsc2V9LCJkYXRhVXBkYXRlUmVxdWlyZWQiOmZhbHNlfSwidHlwZUlkIjoxfX0.L5eZ0ZYJqiL3Iky0Mapo_1UvDmrvYsjUg4UQSMOru_fafzW6p4vzq5BoCcPirQG1JPbqws9A3GttAHC9No_xxOVCNGoTkW-WwRmGOkefcnN_wIKn5ydH7ozPJTy3tRBo8DVkZdwU41dW5Ogccnf2UEGC5XdEf9uft1HNkwSRxpBUy-OF7WYdjuPhj2h6BFJ1v2-OX2znJB0Z5whWx0XYe_605Br2qCpmOhw-bJ8FWNbAH-yt8tf3vJnX6e90BfNnrvfZJgVnVK7I5wANR5szxJ7O4beqzHCIsuQTeWrcFUlHAn2SfB3WCWZ9zug-r79garlXJu0MZrnB8nN0aYc1nQ'
	)
}

const refreshToken = () => {
	const url = 'https://dev-api.kmf.kz/svc/bank/sso/customer/authorize'
	const formData = new FormData()

	formData.append('phone', '+77081991418')
	formData.append('password', 'Qwerty123')

	return fetch(url, {
		method: 'POST',
		body: formData
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

export default function useAxiosInstance() {
	const language = 'RU'

	const axiosInstance = axios.create({
		baseURL: 'https://dev-api.kmf.kz/svc/bank/transfers',
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
		(error) => {
			console.error('interceptors error:', error)

			if (error.response.status === 401) {
				handleTokenExpiry(error, axiosInstance)
				tokenExpired()
			}

			return Promise.reject(error)
		}
	)

	return { axiosInstance }
}
