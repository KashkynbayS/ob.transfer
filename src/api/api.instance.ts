import { tokenExpired } from '@ui-kit/events';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'; // Define the type for your token

const LS_TOKEN_KEY = 'accessToken'
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean
	retryCount?: number
}

// if (import.meta.env.VITE_ENVIRONMENT === 'local') {
// 	sessionStorage.setItem(	
// 		LS_TOKEN_KEY,
// 		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDkyMDU1MDEsImlhdCI6MTcwOTIwNDYwMSwianRpIjoiOWE0ODRkMTMtMmUxOC00NGZmLWExOWEtMTNkYWZhMTEzMDJkIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjYxMTdkNmMxLTFhYmItNDMyYS1iOWI1LWM0OWU2NDk5YTI0MCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiYjBkZWM2OTctZDg2ZS00M2Y5LTk4NjgtNmJmNzlkY2RkYzA5Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImIwZGVjNjk3LWQ4NmUtNDNmOS05ODY4LTZiZjc5ZGNkZGMwOSIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQnNCQ0J3QkNCgINCaLiIsInBob25lIjoiKzc3MDgxOTkxNDE4IiwiaWluIjoiOTEwNDE4MzAwMzYzIiwiYXZhdGFyIjoiYjFhMGRiMTAtZDdmNi00ZmJhLWJmOGQtZDliZGVkZjA4YzAyIiwic2NvcGUiOlsiYmFzaWMiXX0sImNvbHZpciI6eyJpZCI6MTQxMTM4MTgsImRlcElkIjo3MzMsImNvZGUiOiIwMDAwMDEzNTk5NDUifSwidHlwZUlkIjoxfX0.usuA9-aR3ZB6eJjMFTXcVluHirFSOzDSIoLZ5su8wpwf_yKDbvWhzAr4B1qJoaAptUwU4GSOTlU9MQkR9j_EmbBG8xWPNEk7_7PPCLKpj5WaDk4hAK0R3mKaSw8rj986JKo4vaoY_lWK6OywiMYvGTO4ufDljDme3d9eMZEi2pYSUtMRyyN3DxjMMPLO7tQy02cozSpq-DTfkNNwU02C6ONwW_HVYdA-FPhpe5o2Wal1qgGvqwm2q1I8fcdYy6liC5HMMAesnsfCKR79vHsxSY6zYxD3Fmo_md50py2awWpyqRpOZxVvOhPGmoA-SXKechH3QPCq-uGBxkWA8AE4EQ'
// 	)
// }

const refreshToken = async () => {
	const url = 'https://dev-api.kmf.kz/svc/bank/sso/customer/authorize'
	const formData = {
		phone: '+77053811230',
		password: 'ssssssss8'
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
