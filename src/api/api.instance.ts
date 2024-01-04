import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDQzNzI0MTYsImlhdCI6MTcwNDM3MTUxNiwianRpIjoiYmEwMDM3MmMtYThkZS00OTVmLTg2YmItMDE3NzZhZjk4NGU5IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImI3YWNiMTkxLTEzMWUtNDU0Ny1hODc1LWM1NDI1M2JjODQxMCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiZmI2MjY1MTktZjUwYy00YjlhLWIyMDktYjdkMmZhZGVmZWE0Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImZiNjI2NTE5LWY1MGMtNGI5YS1iMjA5LWI3ZDJmYWRlZmVhNCIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJiN2FjYjE5MS0xMzFlLTQ1NDctYTg3NS1jNTQyNTNiYzg0MTAiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0KHQnNCQ0JjQmyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjQodCc0JDQmNCbINCYLiIsInByb2ZpbGVQaG90byI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIxNEEiLCJmaXJtSWQiOiIxNCIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.SKhys0oQNQ2HhHOBPVjPWU8phsmO5stQjwncFPYTkSHwblbUHDJXZSXInEr5TaQfqssnnvDfPr_rWBLR-_fTeiw_lH8Nv8nZsiyV5oO8kyfXffoZPAHcbjof3AIU49xYBuLZUpbMoBL5SFXVwulhmn7x4oElz60Ojm3oQQw7cOzuHZHmOnYT_6MbvdPvHDeTk8ifre0s9fsOSQP6fcHaBUz2BRqRVPI_cg5FztDHqWz9KhgmifIRSUaP_ljR6NElCItq4g_iGnb8ng_RTAVNXkruW_NTpw93HLjEJkQi87mkx2SPdpBZzwgilhIWrpwwzjB-qKV-K7Htt_iFQIR6Ig'
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
