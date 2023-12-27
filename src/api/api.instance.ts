import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDM3MTM5ODMsImlhdCI6MTcwMzcxMzA4MywianRpIjoiYzA3NGQxN2EtZTc2ZS00ZDU2LWFkNGItMDhiZjgxYTAyZGU1IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImZjYTMwOTRkLWY1MWMtNDg3YS04ODA0LTRiMzBmM2NlMWU1YSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiMmFkOGNiOWMtYTkxNy00NDZmLTg0MGQtYzM1OGNlZmVmYjU3Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjJhZDhjYjljLWE5MTctNDQ2Zi04NDBkLWMzNThjZWZlZmI1NyIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJmY2EzMDk0ZC1mNTFjLTQ4N2EtODgwNC00YjMwZjNjZTFlNWEiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0YHQvNCw0LjQuyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6IiIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjRgdC80LDQuNC7INCYLiIsInByb2ZpbGVQaG90byI6IiIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIyNkEiLCJmaXJtSWQiOiIyNiIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.Gw-c_yHDR6YQ5epgxzP7CClOsgmPXs2gg3G8KGq_BgB2Xs5xKso_aeiufWUC_DBBie_pf8xHoURRxMj9UvkP5z7qUGTxz7IE54Xg6KkM-UGkFAWJ-MkUO86bIYbQEK3_PlT_8i9DZD6vQPkVA6MgoFik5vFwuk5Nw8_fGgh7Aw7MP6iz-3CaqE1CN_ZFx4HaeyXYP1emGMf8NKPC3U7aCsPGGK8QbFkFkxPtCxVDf24eOMwr5eJFvux4ypnpQKrwvYjO4b_8xQJizXR262rl2W2VEUpyTzUW_9wdmUFicmAAnx3uz_tffp6MEiZcjwP5XkQIhAAh_k3fBtjanglxFA'
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
