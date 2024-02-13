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
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDc4MDkyNjksImlhdCI6MTcwNzgwODM2OSwianRpIjoiM2YyYjk2YjgtZjRlYS00ODk1LWEyOGMtZTljNzU0ZDIzODhmIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjRlNGNhYjU1LWQ4NTItNDJjOS04MTU2LTY2MTI1ZDVhOTczMyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiNTdhNTZhOTAtYzE3MS00MGVmLWEzMTgtNDg5M2VjMWE2ZmI1Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjU3YTU2YTkwLWMxNzEtNDBlZi1hMzE4LTQ4OTNlYzFhNmZiNSIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQodKw0JvQotCQ0J0g0pouIiwicGhvbmUiOiIrNzcwNTM4MTEyMzAiLCJpaW4iOiI5OTEwMjMzNTEwNDciLCJhdmF0YXIiOiI5YTMyMGFmMy0wNDQ3LTQwYzAtODMxYS1iOTUxZWIzN2Q0NzkiLCJzY29wZSI6WyJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjowLCJkZXBJZCI6MCwiY29kZSI6IiJ9LCJ0eXBlSWQiOjF9fQ.DcbWENLnoHNnhGky3Ovsc0nqLWvsnrEtshZ8G01hsRRpQTddvmFbh5bwJuguSvDmQ2SqAGa71n2SIgQzA-tgXhSkTZnZakhtw1L9JdoCkACVtcLbjZFMF9IpTYy2bzNVJxoj0EMT8TPzuvrohKKvK3HZbVuGLDibLPBjmbpltLmr0SiDE4Hge_ZlZpaUeO5xBAuaZTTPmRPxxO_UoLSaenqT86RHyQR7KVfRFYBVImTlVjkBgyGzRgTBPMHHj5bP4R2ioIlZiq5Zl2OnVtg8mFzL0gWbdlaAIOyvMwDNMwYmMxMwTjVHP1W3nQPIv-yJtEH_nlUDVTFe3a3w0iQLLA'
	)
}

const refreshToken = () => {
	const url = 'https://dev-api.kmf.kz/svc/bank/sso/customer/authorize'
	const formData = new FormData()

	formData.append('phone', '+77053811230')
	formData.append('password', 'ssssssss8')

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
