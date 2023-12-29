import { initEventSource } from '@/services/transfer.service'
import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDM4MzAyNDgsImlhdCI6MTcwMzgyOTM0OCwianRpIjoiYjE4ZWRjZWYtZjk3Yi00YTE4LWIwNzgtZmZiYjdjNzZjNTZlIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImZjYTMwOTRkLWY1MWMtNDg3YS04ODA0LTRiMzBmM2NlMWU1YSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiYzQxNDI3NWEtNzc5OC00N2YyLTlhYTktMDY1MjhmY2JiMjMzIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImM0MTQyNzVhLTc3OTgtNDdmMi05YWE5LTA2NTI4ZmNiYjIzMyIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJmY2EzMDk0ZC1mNTFjLTQ4N2EtODgwNC00YjMwZjNjZTFlNWEiLCJwaG9uZU5vIjoiKzc3NzY2NjY1OTQ3IiwibmFtZSI6ItCY0YHQvNCw0LjQuyDQmC4iLCJjbGllbnRUeXBlSWQiOjEsImF2YXRhciI6IiIsImNvbXBhbnkiOltdLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6IjAxMTExNDUwMDUyMiIsImRpc3BsYXlOYW1lIjoi0JjRgdC80LDQuNC7INCYLiIsInByb2ZpbGVQaG90byI6IiIsInR5cGVPZkNsaWVudCI6MSwiYnJhbmNoSWQiOiIyNkEiLCJmaXJtSWQiOiIyNiIsImNvbnNlbnRFeGlzdHMiOnRydWUsIm5lZWRVcGRhdGVQZXJzb25hbERhdGEiOmZhbHNlfX19.dCgozl1u4wezq30u1A33Lx8oExCjdDX6AQ1I4NqERsG6OPPcw06mDm-5PERul7AQB9Nn6pRPFP80pAdtdxexZJ0hofR6uZ_sFa_PujxspiySaq5Cv3hyHI-1KBEbG0nGFj2JYWOF39dqI6rrRz45CW-RDwLIFhOYwACUmePkkrwzLfAVIIbJHFP65wE1cxcRUfCT-wckp-wDw8qvlMho4NHSWRtcWXNMujM4WRtG1rW_1VoH2gxzlXrjDXvJ_YjLGlz0FhSqS2AIKp3AVvxhUtNSOrWlsLuW_1YmuoThjMyDVoW6Ua3Bms48NmNKFUq9AwCVcRVHsB_roCxM83zpww'
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
