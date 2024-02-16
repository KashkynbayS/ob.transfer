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
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDgwODMxNTIsImlhdCI6MTcwODA4MjI1MiwianRpIjoiZGQzN2YxYjYtM2NhMy00YzhjLWE0NWEtNGI2NDMwNjc2Y2UzIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImY4ZDg0YWFhLWMyMjEtNDFjZC05ODc3LTQ0NDMyMmEwMmQ3NiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiNWFhMTgzNWUtYTdmYS00NDMyLWFmOGItMmVhNGU0ODFiMmUzIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjVhYTE4MzVlLWE3ZmEtNDQzMi1hZjhiLTJlYTRlNDgxYjJlMyIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQmNCh0JzQkNCY0Jsg0JguIiwicGhvbmUiOiIrNzc3NjY2NjU5NDciLCJpaW4iOiIwMTExMTQ1MDA1MjIiLCJhdmF0YXIiOiI0OTllZWQ5NS1jNDc2LTRjMWEtYjhiMC04NzRmNzk5NzQ5NjUiLCJzY29wZSI6WyJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjoxNDExMzc3OSwiZGVwSWQiOjczMywiY29kZSI6IjAwMDAwMTM1OTkyNCJ9LCJ0eXBlSWQiOjF9fQ.AaxUtEnbqNv-Wcl5gmFMv1tjp-tP2TDfH8UvVZdaLJerKVHPeo1wpjzM7mnnAG683usd6yK8P2RDe4Xzap4CiFcofNyzlMzp4w0MCSsDSU0ZbdGX6Mn5xI7VnRNCoSli9JYS_flT9IWBhl5n9An1EWP-mPc_n_f2oG-fuk7x4NQKc1F48o5HGIei_aYPQbChbg-XyNaGpAfyiR0eSKUlSJZXHZIUjfo7528OgySuCLakjblY_NT6xP2Lc_xElVXV_bzIBVYJEy_lWZW_Tu1XTvgM3p6a5veWCgRpCNPxm3HkOMEtXqz6EiMX9BCYcqNCsz5Tw9WQJcULKji11Dy4Vg'
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
