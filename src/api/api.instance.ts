import { tokenExpired } from '@ui-kit/events';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'; // Define the type for your token

const LS_TOKEN_KEY = 'accessToken'
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean
	retryCount?: number
}

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MTA5MTk5ODQsImlhdCI6MTcxMDkxOTA4NCwianRpIjoiMTQ5YmViY2QtOTBiMy00MTIwLThhNDktMjU5MWQwMmI3ODlhIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjkzNDE4NGZjLTczYjYtNDM4YS04ZmMxLTU4NTMxMmYxYzk0NSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiOWM4M2ViNTEtYmU4Ni00YzZiLTgzZDYtNGNkNzEwZTcwMTQyIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjljODNlYjUxLWJlODYtNGM2Yi04M2Q2LTRjZDcxMGU3MDE0MiIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQnNCQ0J3QkNCgINCaLiIsInBob25lIjoiKzc3MDgxOTkxNDE4IiwiaWluIjoiOTEwNDE4MzAwMzYzIiwiYXZhdGFyIjoiMmNiYTRmNWYtMmI0OC00NzBkLThhMTEtZDUxNGFmYjgyYTk3Iiwic2NvcGUiOlsiYmFzaWMiXX0sImNvbHZpciI6eyJpZCI6MTQxMTM4MTgsImRlcElkIjo3MzMsImNvZGUiOiIwMDAwMDEzNTk5NDUifSwidHlwZUlkIjoxfX0.GgLWh8H4400DJRYb8oWYBYz806uhV9mlhBW49wF02F_dnMGkbN1MhrpDpUXT-2psktfC1CmGbeSfHreR_PpMqzpP9YY7uLSXUbrLRlrK3got-yYBLhvTTy1c9G-hHk82D0z4QZSEU_aYuNua0_-wSP_pfkdciufHUhGPRnPzCo5qLcO1PUXzjnq8v-5VVTJfSkWc70apOA2e8U6v33KeJ8vQqP06S5vV8RF2YEet6Y-KM59O9qpuN2vLPuLK0ugnnmgcxVtdKn2d-Gx5EH0vM4fm5nJfF12Ruq0kXkRt9jVOY3wXsCRPh_cObX27unvOjFFjF-oZ1-CIlTlJYb_ieA'
	)
}

const refreshToken = async () => {
	const url = 'https://dev-svc.kmf.kz/api/bank/sso/internal/customer/authorize'
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
		async (error) => {
			console.error('interceptors error:', error)

			if (error.response.status === 401) {
				await handleTokenExpiry(error, axiosInstance)
				tokenExpired()
			}

			return Promise.reject(error)
		}
	)

	return { axiosInstance }
}
