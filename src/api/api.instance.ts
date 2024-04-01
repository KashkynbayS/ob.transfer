import { tokenExpired } from '@ui-kit/events';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'; // Define the type for your token

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://dev-api.kmf.kz'
const LS_TOKEN_KEY = 'accessToken'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean
	retryCount?: number
}

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MTE2NTc1ODcsImlhdCI6MTcxMTY1NjY4NywianRpIjoiOTBhNWNlYmEtMWM3Ni00MDRhLWIwNTEtMGM1MGJlY2E1YzRmIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjZjZDhiOWFhLTA1MjktNDA2Yi1hOGZlLTkzOTZjZDhhOTE4NSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiMWRmYjE0ZmYtZDQ3MC00NDRiLTk2YzgtMTUwMzM1MTEzMWQxIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjFkZmIxNGZmLWQ0NzAtNDQ0Yi05NmM4LTE1MDMzNTExMzFkMSIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQnNCQ0J3QkNCgINCaLiIsInBob25lIjoiKzc3MDgxOTkxNDE4IiwiaWluIjoiOTEwNDE4MzAwMzYzIiwiYXZhdGFyIjoiMmNiYTRmNWYtMmI0OC00NzBkLThhMTEtZDUxNGFmYjgyYTk3Iiwic2NvcGUiOlsiaW50ZXJuYWwiLCJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjoxNDExMzgxOCwiZGVwSWQiOjczMywiY29kZSI6IjAwMDAwMTM1OTk0NSJ9LCJ0eXBlSWQiOjF9fQ.LWgwJZh8gOcw63EIRHr4znzYgGpMfX4Mwvl-pG_O_C2FaszomsGpV551SOg9dyt_4lHxIv0Hzs7drquJowa2DX1WJBVJiBAMkdqGWl5fbG8dVJlOm91PhqOTtHzZ1MwyfvNnxhcdnb-NEN6HgFEbJRd4g2NcP0GHK2tX6Oavf8r0ynbzVlsIo38PCvZICIk4zM7hldNDWFs68xmZtCACjR__kbaNt2ZGZJOapgrI7_Xkqgt01yN_ufjdxqWEspv9PaV6YAINtOu4hPiAzwybiFkiVbZHtHKpuZINUItVNiXvBf9Oesyi6IJQ_O4ExJ66knWqMunrGT_8b9E5_bPsbg'
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

export default function useAxiosInstance() {
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
