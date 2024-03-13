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
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MTAzNTI4NTAsImlhdCI6MTcxMDM1MTk1MCwianRpIjoiMWZhYWMxNjYtZjQ5ZC00NmQwLWIwNTYtMzcxNmYyMWFiMjg4IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImJlZmMxNWMwLWUxZjMtNDI5My1iMzA4LTM5MTcyMTU1NTk0NSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiYzRkNTE3MjMtODgyMS00NWRhLWJkMDMtODM3N2EyZTQ1ZTAxIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImM0ZDUxNzIzLTg4MjEtNDVkYS1iZDAzLTgzNzdhMmU0NWUwMSIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQodKw0JvQotCQ0J0g0pouIiwicGhvbmUiOiIrNzcwNTM4MTEyMzAiLCJpaW4iOiI5OTEwMjMzNTEwNDciLCJhdmF0YXIiOiI1MTE4MWNlOS0zNWM5LTRkMWEtOTJhMi01NzU2MjUyY2RlMTIiLCJzY29wZSI6WyJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjoxNDExNDAyNiwiZGVwSWQiOjczMywiY29kZSI6IjAwMDAwMTM2MDExMSJ9LCJ0eXBlSWQiOjF9fQ.dxWMU0FJJiTl3bjDVZirhnCEmEqFJgntUBEXCedBEvMfKnomZxpRqSBDtKWS6M2xmerTXv6pNu52gukejOIl-2JnTsSxd0v9VA5V8UAy9CZRO2efxpz5gmFHqjiiBBUizs1A8pvy_znme2S4KzxwsJp7lXcBbeuVU1SQ4btCXf414szLP3RPt6RnBjPUwH0OOq9jx2IUy3I-cr4q73BzL5k64ckVT4LHP1o7LX9bYD5hMrorcT-MUi8ms2b9_WoYKYS3bDVpwpVa6ZsTjJgCvNUCt0PgzTjlQuyV3hn39qaAfC1-4IiSoEvVkyoFEoIauvVTRAeAHXlEbako2xzV4g'
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
