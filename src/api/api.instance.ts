import axios from 'axios'
import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDM1NzIzOTMsImlhdCI6MTcwMzU3MTQ5MywianRpIjoiNjI5YmVmYjItMzdlOC00MmU3LThjYjctY2ZhNzI0YzhkMTczIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImZjYTMwOTRkLWY1MWMtNDg3YS04ODA0LTRiMzBmM2NlMWU1YSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiNGQwMmE5M2ItODE0MC00ZjYwLWJkNTAtY2Y4MGVlZDk2NzJhIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjRkMDJhOTNiLTgxNDAtNGY2MC1iZDUwLWNmODBlZWQ5NjcyYSIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJmY2EzMDk0ZC1mNTFjLTQ4N2EtODgwNC00YjMwZjNjZTFlNWEiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0YHQvNCw0LjQuyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6IiIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjRgdC80LDQuNC7INCYLiIsInByb2ZpbGVQaG90byI6IiIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIyNkEiLCJmaXJtSWQiOiIyNiIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.kwkcrsOUX1_XPsvTf4xC2jY9xDEYo10laoC-EjH686HVHaPqlTFqiZqA2CvCZZ8KZoRm_a5dtT2PpgNNtD2te3xiPsKHUizLNqiGCqYE6C6025HKgiqEZNAjLSwptplnz3pPqoHjZ8PTkz8KkwXbksnMzVP8Zr4Ti3v9v46Gl6H-yxY0KwviCXkPiPR0NEgqujpeUmLK_mEjVESj06Gh27R-rCq9_IzPmzyCzelQprDX5QVuO2PyPyfNH_4oeoaLQ3mX_QJxNf5DqxdLOs4HXzwKkBmh_h0nNkvkVUPfsTBLdLeiFvD1bKdigtlgRu2cCqyDOFUuHgRhD0Hd9k_uzw'
	)
}

const getAccessToken = (): string => `Bearer ${sessionStorage.getItem(LS_TOKEN_KEY) || ''}`

const loadingStore = useLoadingStore()

export default function useAxiosInstance() {
	const language = 'RU'

	const axiosInstance = axios.create({
		baseURL: 'https://dev-api.kmf.kz/svc/bank/accounts',
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
