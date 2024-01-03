import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDQzMTE5NjgsImlhdCI6MTcwNDMxMTA2OCwianRpIjoiYTY3ZjZlNmMtMGVjZC00Njc0LWE2OTYtZDUxMjVkNmYxN2FjIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImI3YWNiMTkxLTEzMWUtNDU0Ny1hODc1LWM1NDI1M2JjODQxMCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiOWU4Y2I4ZTEtMzg3OC00ZWJhLTg3NWQtYTU0NGM0Y2EzNzFiIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjllOGNiOGUxLTM4NzgtNGViYS04NzVkLWE1NDRjNGNhMzcxYiIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJiN2FjYjE5MS0xMzFlLTQ1NDctYTg3NS1jNTQyNTNiYzg0MTAiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0KHQnNCQ0JjQmyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjQodCc0JDQmNCbINCYLiIsInByb2ZpbGVQaG90byI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIxNEEiLCJmaXJtSWQiOiIxNCIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.tN7JoZl3BnW76e3PSMVp9th3EhtfOT5k60Ie-M8R5991LxyAlz1Cn7J6eyFIdzXXifelK09psY0jxxaWeQLiQPBXLgMBZJwdg_jA0vkxq_V54HJfIx8Xi9BjyXRIsriSTAK9TjCoEEHdg5QNTtI_mP8M7gmU7dRCrMGNimgcOqZDi6YFh88JSbZISjhiRln8WLpwnDImtSmRFkJfPxvugvU1UAWwZ-nk3d3bOeznnFqBtb6fac7n9HAEzD7G-KCnVTix3c8BCjHQ3GcN4qcMIZjFjNeKKaoif78H5x9KCr-MPH4xo4JqjgRQaKjAV1g3kQXh4GO_W3wJ2baZWC7U_g'
	)
}

const getAccessToken = (): string => `Bearer ${sessionStorage.getItem(LS_TOKEN_KEY) || ''}`

const loadingStore = useLoadingStore()

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

			if (error.response.data?.msg?.includes('token')) {
				console.info('token error', error)
				tokenExpired()
			}

			loadingStore.setLoading(false)

			return Promise.reject(error)
		}
	)

	return { axiosInstance }
}
