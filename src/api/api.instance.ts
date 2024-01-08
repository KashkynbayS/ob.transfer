import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDQ3MTE5MTYsImlhdCI6MTcwNDcxMTAxNiwianRpIjoiNTNhYmU5OGEtOWYzOC00YzNkLTliMTgtMzljYmI3MDFhNWJjIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImI3YWNiMTkxLTEzMWUtNDU0Ny1hODc1LWM1NDI1M2JjODQxMCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiY2VmYzhjYzMtMjkyZS00NWRmLTk3NzAtNTg1Mjg1NzY3MDk0Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImNlZmM4Y2MzLTI5MmUtNDVkZi05NzcwLTU4NTI4NTc2NzA5NCIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJiN2FjYjE5MS0xMzFlLTQ1NDctYTg3NS1jNTQyNTNiYzg0MTAiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0KHQnNCQ0JjQmyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjQodCc0JDQmNCbINCYLiIsInByb2ZpbGVQaG90byI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIxNEEiLCJmaXJtSWQiOiIxNCIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.eEy1muH93zZDn3XmOGMycpHTrtKrZYUk2VYYW-Q4-p8RIsrg7-yQ9xzR_-WV-xzM5PfVViD_cJxff8WA3FfctkkApdptHTTOM9Hq1YbEbScoJ973lkw7VVIGJsU2Ubt6wDRxr4kkC31o0waoddPnEXMTGo5RjkDZgc3tUNND5Xf9KX5lQ0b0F1iQY4I9FzEGAqoD-1q1cNg5-HYYmP6_4u6lUyyB8cj7_qureygJNF2pVTr_CpW1-nIysOab2vFKA84hckhURGsY8FwWmNyBCPpTPaVCT7vEpORJ-SW6gh99juHGwnJRw-y-JpEKAX143zdTbnwdDtI29juk_1Ff3g'
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
