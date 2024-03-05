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
// 		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDk1Mzc5ODcsImlhdCI6MTcwOTUzNzA4NywianRpIjoiMDhlZDAyMjMtMDg2YS00Y2ZkLWEyODYtMjhlYjk4ZmE3M2Q0IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6Ijk1N2M2NWU5LTc0N2EtNDJhYi05NThjLTRjMmJhNWU3YzUyZSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiMTU5Mzk1OWEtMTk3NS00MmMzLTk4NDMtNDM0ZmE5MTE4ZDRiIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjE1OTM5NTlhLTE5NzUtNDJjMy05ODQzLTQzNGZhOTExOGQ0YiIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQmNCh0JzQkNCY0Jsg0JguIiwicGhvbmUiOiIrNzc3NjY2NjU5NDciLCJpaW4iOiIwMTExMTQ1MDA1MjIiLCJhdmF0YXIiOiJhNWRmNzVmMy1jZTk3LTRiMzAtYjk5Yi0yNzk4NTliZDg4MTkiLCJzY29wZSI6WyJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjoxNDExMzc3OSwiZGVwSWQiOjczMywiY29kZSI6IjAwMDAwMTM1OTkyNCJ9LCJ0eXBlSWQiOjF9fQ.hv8sKfOsiANsnJlZU1XizAW-oCmgdCL2BfM1u_BHg5t1z8yvU40ZFii_b8iE-kD7Xp4Gf7x9X6vFefafoFzhXikKnNYEf41Y2u31WdhjF27JhsSojc0Isz8srmAPokFZTZt7aDS2izFrmJvpPHceXtxjnuh5Q_Z_Xc2lRUQHQR-a6NgjDSb-fyYLndYzhQHb8ry3jpNJkCVTy9mDbxaiVJDzUkw4qL2oi1XJ7kfI1DJhDn2sjnqMSL7tgx1yDROabRBsUwOfgfE0hXwbF66DkU0FFjIgZQ1V2JIvD11Co3bzo2AOL0p7HNWNOQux4gT2kFwa4Ju8i1Yg_upXP0vvIA'
// 	)
// }

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
