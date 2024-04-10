import axios from 'axios';

import { tokenExpired } from '@ui-kit/events';

import { useLoadingStore } from '@/stores/loading';

import { requestTokenExpiredInterceptor } from './interceptors/request-token-expired';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://dev-api.kmf.kz'
const LS_TOKEN_KEY = 'accessToken'

// if (import.meta.env.VITE_ENVIRONMENT === 'local') {
// 	sessionStorage.setItem(
// 		LS_TOKEN_KEY,
// 		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MTI1NzEwOTYsImlhdCI6MTcxMjU3MDE5NiwianRpIjoiODg2NDYzMjEtNWEzMy00Mjk2LWJjM2UtNzMyZmZiN2QyNWMyIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjQyNjU2OWU3LWJkNjMtNGE2ZS1hOTRkLTgzMzA0ZjVkNDU2NiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiNWExZTg1ZDMtZGYwNC00ZWNhLTlhNmYtNzc2YWUzMWY1N2RmIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjVhMWU4NWQzLWRmMDQtNGVjYS05YTZmLTc3NmFlMzFmNTdkZiIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiNyIsImJyYW5jaElkIjoiNzgiLCJuYW1lIjoi0JTQkNCh0KLQkNCdINCgLiIsInBob25lIjoiKzc3NzcyMTY1NjU2IiwiaWluIjoiOTEwNTAzMzAwNTA3IiwiYXZhdGFyIjoiNTJkNjljMDYtYzAxMS00Y2FmLWEyZjEtMjA2NzE3OGIwNmFiIiwic2NvcGUiOlsiaW50ZXJuYWwiLCJiYXNpYyJdfSwiY29sdmlyIjp7ImlkIjoxNjM5MjYsImRlcElkIjo3MzMsImNvZGUiOiIwMDAwMDA1NDc2ODIifSwidHlwZUlkIjoxfX0.pjQT33OKGJJt1bY-OgZebf9GAQS_LwNllHfaEajZybmXTZTHgMnbmjmj9LHoSpUhLrFhQYx5RBkDzORgNREm7Rctpo3YJX3j_PhvLUBE6GoRQDIYewQfmdCkDkk0Zel4tC9fCviES6hNraVjlTHxWy6bJsZtbdwH321LENmlbRWg6FdT4SNlJL-4ZVDRc77MpeuLdtHjSiCk-TqIuxWfKxE6Cm2f2czpiGkYBnObRDboM3i7axdzURs8wB3v_GnflSzVnXHgseQMmvR5yd5Gdctgu7MYCrmUJ7_-Iz77M_4-tQIxBWg6roSape5jyJwb3NnzZMDtR5-c1CGPz9VQzA'
// 	)
// }

const getAccessToken = (): string => `Bearer ${sessionStorage.getItem(LS_TOKEN_KEY) || ''}`

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
	(response) => response,
	(error) => {
		console.error('interceptors error:', error)

		if (error.response?.status === 401 || error.response?.data?.msg?.includes('token')) {
			console.info('token error', error)
			tokenExpired()
		}

		useLoadingStore().setLoading(false)

		return Promise.reject(error)
	}
)


axiosInstance.interceptors.request.use(requestTokenExpiredInterceptor)

export default axiosInstance
