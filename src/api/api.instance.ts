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
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MTA0NTI4MDEsImlhdCI6MTcxMDQ1MTkwMSwianRpIjoiOWY0N2NjMzgtZTg5OS00NzEyLWI5OTUtMGU1ZGZiNDYyYjQ0IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjkzNDE4NGZjLTczYjYtNDM4YS04ZmMxLTU4NTMxMmYxYzk0NSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiMzEyMWZmYWMtODYyOS00MzI4LWE1MzgtMjg3OTMxNDI5Yzk4Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjMxMjFmZmFjLTg2MjktNDMyOC1hNTM4LTI4NzkzMTQyOWM5OCIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQnNCQ0J3QkNCgINCaLiIsInBob25lIjoiKzc3MDgxOTkxNDE4IiwiaWluIjoiOTEwNDE4MzAwMzYzIiwiYXZhdGFyIjoiMWMzY2JmMGEtMzVjMC00NmMyLWIzMTktMTk5ZWZkY2I2YTAyIiwic2NvcGUiOlsiYmFzaWMiXX0sImNvbHZpciI6eyJpZCI6MTQxMTM4MTgsImRlcElkIjo3MzMsImNvZGUiOiIwMDAwMDEzNTk5NDUifSwidHlwZUlkIjoxfX0.EFB7fqE9NUkqc_dEePu_3htdjPvf_IEqXyn1BxA-l7r-YhfUO7IcFN6-z-hsyhG2DnAGdZ5CEk-XPPiMXFL6qxvItjgW7ZosJ_xKN_jODZY8Jf92mT8PJwkCckpcKWRKp73lbnkMz-DFKa2MqSowpGDH-gDoonvQJ_65FUR99fOgaGb58Juf69_UhLOHps2hAYWUQ-Vc-cqfqwZmt7GkY7rbuPWYZnaALpUbQHgp7n9Neri-E4ZIFgqZOOgO82gxkUcjzYi5xObnMVRvenHaAp8KoItefkSNtPIBnwNVScbh346UcQXzPJOwGCVEt0r_JLRPhVhWEOZb9RaG8HIjbQ'
	)
}

const refreshToken = async () => {
	const url = 'https://dev-svc.kmf.kz/api/bank/sso/internal/customer/authorize'
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
