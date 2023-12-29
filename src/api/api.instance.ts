import { initEventSource } from '@/services/transfer.service'
import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDM3ODI1NDQsImlhdCI6MTcwMzc4MTY0NCwianRpIjoiNjhiODIxYjItNGZhYS00NDI0LWIyZmYtZjc3NDllN2E1ZTFmIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImZjYTMwOTRkLWY1MWMtNDg3YS04ODA0LTRiMzBmM2NlMWU1YSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiNWRhZDg1NjgtNjA5My00YjE4LWJkY2ItNmI2MTBjYzZiOGUwIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjVkYWQ4NTY4LTYwOTMtNGIxOC1iZGNiLTZiNjEwY2M2YjhlMCIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJmY2EzMDk0ZC1mNTFjLTQ4N2EtODgwNC00YjMwZjNjZTFlNWEiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0YHQvNCw0LjQuyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6IiIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjRgdC80LDQuNC7INCYLiIsInByb2ZpbGVQaG90byI6IiIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIyNkEiLCJmaXJtSWQiOiIyNiIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.IFOwzr4OyohC4nD2i5W2zZlj97xRq2DjbX85dhZVrlXuwJZaJx7H47B6FBINyBeV7pqDQI-iR5S88ALHPoA8Bb93ybZqnpsv5a5KlgSQKmV8qh5qBxBgb6Z1wl6m7ZSUyFSE3QvA2m-M1LYGmo3f3YWQZsLJiQP0JKgLtaVUyFDaxTc2BxSVgTFaSPDea8jewi9AU-8yrwAzTwz_1aJODFlKWHDMpkrLhIVKxbEl4v6ri-YU80WPc0cxwtyuQmQWsI7aRTx0Ij35Frz17K_pCSs4Ijd5TGB_FmadYNXa7nDj7SSefQgNUV-OG9rm1i20BdBpcQSixUFpAOTRcVetpQ'
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
			if ((response.request.responseURL as string)?.endsWith('/main/init')) {
				initEventSource(response.data.data.applicationID, () => {})
			}
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
