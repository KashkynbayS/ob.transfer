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
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDkyMTAwNTcsImlhdCI6MTcwOTIwOTE1NywianRpIjoiMGZiNTUxNTEtN2YxMy00OWRkLTg0ODEtNjk3OTRmOGM3MzA1IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImQ1ZDE3ZmVlLTFhZGItNGFkMy1iODJlLTk0OWMyNDg3ZDgyZiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiODQxMTc0YzQtMmEwZS00YWJlLTljMDUtMTRjYTI0YzA0OWFiIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6Ijg0MTE3NGM0LTJhMGUtNGFiZS05YzA1LTE0Y2EyNGMwNDlhYiIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQodKw0JvQotCQ0J0g0pouIiwicGhvbmUiOiIrNzcwNTM4MTEyMzAiLCJpaW4iOiI5OTEwMjMzNTEwNDciLCJhdmF0YXIiOiI1MTE4MWNlOS0zNWM5LTRkMWEtOTJhMi01NzU2MjUyY2RlMTIiLCJzY29wZSI6WyJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjoxNDExNDAyNiwiZGVwSWQiOjczMywiY29kZSI6IjAwMDAwMTM2MDExMSJ9LCJ0eXBlSWQiOjF9fQ.ZqqjSSV8MWmkF1DC8KshOl6BdKvC65LKJyOF3PP69015YHHJnHlVUwLBBbde1oYNeF7HeTeBPMI5-SBp6TA4ZkH9cgJKhMpA-PpUcQ-6HPz-ZS6WCDoLD29xROhD_CJoDnH2blZ1jdk-6lORD4qRB_KMyCxdzwpiM8APa1rdc7aHs7t-io8Y6t7BoPcwDnEsVHeFWIXIgXBchPxVMGoVzsnhaFH6ZCXAjk0rxexyX4YyiuzY5q8vaXW6E6k4MvuSoshOi8CKUccdajARDdyCIf6lb0sieGta-3OantBhjAxS7S1K6HFRsPTISyQizlxYdRAz27aijxmcsHfvPS7jQQ'
	)
}

const refreshToken = async () => {
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
