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
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDc0NjEwNzIsImlhdCI6MTcwNzQ2MDE3MiwianRpIjoiZWJlMmYxNmYtZmM5MS00MjdhLWE1MTUtZmEyYzkxZDk5OTE3IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjRlNGNhYjU1LWQ4NTItNDJjOS04MTU2LTY2MTI1ZDVhOTczMyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiMjNhN2I2ZGMtOWYxMS00MzRiLTgwYmMtY2ZiMjNmNzRjNDQzIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjIzYTdiNmRjLTlmMTEtNDM0Yi04MGJjLWNmYjIzZjc0YzQ0MyIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQodKw0JvQotCQ0J0g0pouIiwicGhvbmUiOiIrNzcwNTM4MTEyMzAiLCJpaW4iOiI5OTEwMjMzNTEwNDciLCJhdmF0YXIiOiI5YTMyMGFmMy0wNDQ3LTQwYzAtODMxYS1iOTUxZWIzN2Q0NzkiLCJzY29wZSI6WyJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjowLCJkZXBJZCI6MCwiY29kZSI6IiJ9LCJ0eXBlSWQiOjF9fQ.I8DQGgi1qUxFOrnpD-c-mKJDlYhRCJSG_NAKaWscJGQnNfRdVGIME-lowX3F4D8u5bK7TYTcNImoLgnWXcYdQaMyCEajKz-2IX6bO_JV52K_D8LnTrSsDm_e2PZLDR4PppLP1HffEZzisv92cgmBoScXMhCD6oeE6McEc9QJZZlrdyYzBp3tP92h3zLeWwd5BeIvtetenEDiMjRv75KhQPy0geHq8Kf3XpeK_M4Ep2r0V6gc6v38CiRGyPxv85lvXz7G9dRzeiB5r7SKaT6-97_GKFzPp5o9gyCg-LTMrf525vUBczxtdZbAfZMLfG5TAnNSyxeVK7w6UOYuVmqyMg'
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
