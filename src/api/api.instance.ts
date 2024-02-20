import { tokenExpired } from '@ui-kit/events'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios' // Define the type for your token

const LS_TOKEN_KEY = 'accessToken'
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry?: boolean
	retryCount?: number
}

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDg0MTAzNDAsImlhdCI6MTcwODQwOTQ0MCwianRpIjoiNGNlOGZkZGYtNzNjNy00MmJkLWJlZTAtMmQxYmY3MTA2NDA1IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6Ijk2Y2JjM2MzLTBiMzUtNGJkOS05ZWEwLWIwYWU1ZGYzZmFhMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiNmEwMmM0MDktYjk0OC00YzY3LTlkNTMtNWU0MTFmODA4Mzg3Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjZhMDJjNDA5LWI5NDgtNGM2Ny05ZDUzLTVlNDExZjgwODM4NyIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQpdCQ0JzQmNCiINCULiIsInBob25lIjoiKzc3Nzc3NzMwOTU2IiwiaWluIjoiOTAwMTAxMzAwMDM3Iiwic2NvcGUiOlsiYmFzaWMiXX0sImNvbHZpciI6eyJpZCI6MTcwOTgwMywiZGVwSWQiOjczMywiY29kZSI6IjAwMDAwMDAwMDc5NCJ9LCJ0eXBlSWQiOjF9fQ.jq4f6AuG906hyvAisL75w5AdfFJp3v-IBTp94ni8lCmxPIYLPBRF78c9GqJLhmMTBRGzS_Nsy-PJ_wOaJR8HbRJjkzlGqWijI7UvdR7AABUPk3gi72Yl098FkSO_8eyH-gd8WjAYijOff9jgGBRrmagdv6j_C89tIiRboB9D9hrf-klw6bybb8PdUMletQ_hYLPvpeKVuWWb5CxzEJymGTwai9f3lSb2S48cy_fpcXL2nZRgbSKLIXtzPt43VeAc4ytcfNSFR0pvzNi-9GXj3HIS_DVSTDoLTCt8i4lLEIF3CZ1ItLEUMJManNyoUTIcUl_kSqAmEMeV__FhSZ1sTQ'
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
