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
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDgzMzcwMzUsImlhdCI6MTcwODMzNjEzNSwianRpIjoiZWViMDI1NjYtMzRiZi00Zjg4LWJmNTQtNzAyNWQ4NThhNDI2IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImE5MGJkODZmLWI5ZjItNDgxNC05MGNhLTVhM2I2MTQ4ZWRhOCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiZGUxMGE5ZjMtMWVkYS00NGYyLWJjMGYtNGEzYjMwYTk1ODdhIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImRlMTBhOWYzLTFlZGEtNDRmMi1iYzBmLTRhM2IzMGE5NTg3YSIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQodKw0JvQotCQ0J0g0pouIiwicGhvbmUiOiIrNzcwNTM4MTEyMzAiLCJpaW4iOiI5OTEwMjMzNTEwNDciLCJzY29wZSI6WyJiYXNpYyJdfSwidHlwZUlkIjoxfX0.SMP2CsVz9QNw3J2_NdkvGs0DpFwHTbZM_ieLKiIEZzUGnbkkFXkCUGDuwSEt1tpTldPPJ4ZKWFxY_V3L1GS1SUUAShP_JyINl9H5aTHOM6RAACqL4cDRuzlSfWeLr-iIsZgAhfxxIWjhbCHin7qTG1vyh29YMgpSM1w-YFD88MYOpY8LWk9jm9mOmTBxR4-6zCjJuWnn_beDOT2J8k7UCmo4IabD99TqIYVvqVo4TWa3nkIbsnkezXLOdSj48Nr0evKl5PB9VP2q1tUQjueTL_fQ8MwdzvocwBxM0YkbUryVCyv2B_dOoReNfBo6RYyV9EsiMm6NoeuwLkVDvG2xpg'
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
