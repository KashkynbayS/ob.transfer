import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDQ0NTM2NzQsImlhdCI6MTcwNDQ1Mjc3NCwianRpIjoiZmRlNjMzYzEtMzU4ZC00ZDRmLTkyY2EtNTY1ZDI5YWNlM2UxIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImI3YWNiMTkxLTEzMWUtNDU0Ny1hODc1LWM1NDI1M2JjODQxMCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiNGVlYjI1YTUtMTUyNi00YWFkLWE5MjQtYWRkMGNjN2VjZjJhIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjRlZWIyNWE1LTE1MjYtNGFhZC1hOTI0LWFkZDBjYzdlY2YyYSIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJiN2FjYjE5MS0xMzFlLTQ1NDctYTg3NS1jNTQyNTNiYzg0MTAiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0KHQnNCQ0JjQmyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjQodCc0JDQmNCbINCYLiIsInByb2ZpbGVQaG90byI6Ijk4OTc4OTJkLTc3ZmUtNGJjNS04YTY4LWNlYjE2ZjVhOTBhNyIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIxNEEiLCJmaXJtSWQiOiIxNCIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.ccWZaC_LtZVq-GEUK6y7PYOO2cDdtCxjdTxIHDZPyDf8WIvXhmSecl422YCSf60KFhplCHpVz6HOzFuwhEcFiMRu_w5lEz_ZO7W2gejWOONz4GyL2KFlemfz-rSMoM7K9j0sGeoSaz6VuRJWE7rtetOg-8MgPyi_mxYw0VYmQlC2giN1krMtzU0tN06fuTf1MZmm5hzFp16JQSowjYgZX52DPSb398WozdPSYDJ_CZxpSLJ1pHVqxoAfRKwNvPMaaseTUO4g6O-VWlmIekKO-kHvlvAhaIYsUvgJ0JkIbtEKNDArwvDxfDAsr5w9ZyMg_LxuIWXjk_crM9oyQOnfUQ'
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
