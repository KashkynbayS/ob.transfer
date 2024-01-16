import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDUzODI1MjcsImlhdCI6MTcwNTM4MTYyNywianRpIjoiYmVhNDFhMTItMDRlZC00ODBiLWE5NDMtYWRjM2QzYzQyYTFjIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImVmOTMwMjYzLWI5ZjEtNDlmZS05YmU1LTkyMjQ1Y2M3ZDliYiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiM2ZjZmFlMTEtYTZjMC00YjkxLWI1MzYtYjdjOGNkZjc5MGYzIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjNmY2ZhZTExLWE2YzAtNGI5MS1iNTM2LWI3YzhjZGY3OTBmMyIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTQiLCJicmFuY2hJZCI6IjE0QSIsIm5hbWUiOiLQmNCh0JzQkNCY0Jsg0JguIiwicGhvbmUiOiIrNzc3NjY2NjU5NDciLCJpaW4iOiIwMTExMTQ1MDA1MjIiLCJhdmF0YXIiOiJmNGMxMTRhYi1lOGYxLTQxOTAtYWMyYS1lMGU4ODU4YTUwOTciLCJzY29wZSI6e30sImNvbnNlbnQiOnsiYmFzaWMiOmZhbHNlLCJleHRlbmRlZCI6ZmFsc2V9LCJkYXRhVXBkYXRlUmVxdWlyZWQiOmZhbHNlfSwidHlwZUlkIjoxfX0.tR1nWdC4vyjrlFzjrUPdHWJ5ehMCgEq4vIwbCxHADO_d8WLqip1RqAdgahHQylDcSYTmXOjs0PZYKxaoj2h6zdFi9SFeug8XtEQ1aEHo-e0Ei8beweiZDDkGiXRZsGQt_qz5eosfDcDCiQQ_dOJ7lcMSr2CuqC7zxCRr135IcJVdoxugCmgWze3UD_-gQ-EyNlAKzDWQgL40VWCFgUZxtDLU8nP5jUNpsF_CHcY59pB5poXm9di_e2GjPu8TSmqdhIdNvtA34NMco9pERIYLrRoTJkB12OxtbH-wvI6FyW5ZYX6jBYSO_cHM0I5wVN86mufdAVg62-6wEokXSKtO5w'
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
