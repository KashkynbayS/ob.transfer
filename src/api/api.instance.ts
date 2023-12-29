import { initEventSource } from '@/services/sse.service'
import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDM4MzA5NTIsImlhdCI6MTcwMzgzMDA1MiwianRpIjoiMzQ2YjMyYmEtMGIwZC00NjQ3LTgwODQtZGM4NWE2NGZlNmNkIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6IjhkZDA4NTk2LWFjMzMtNGNkMC1iYTE1LTk5ODA0NWNjZGE3ZiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiYmM2OTc1Y2MtN2EzYS00OTE1LTk3MmItNTYzZmUyMzM3OTczIiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImJjNjk3NWNjLTdhM2EtNDkxNS05NzJiLTU2M2ZlMjMzNzk3MyIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiI4ZGQwODU5Ni1hYzMzLTRjZDAtYmExNS05OTgwNDVjY2RhN2YiLCJwaG9uZU5vIjoiKzc3MDgxOTkxNDE4IiwibmFtZSI6ItCc0JDQndCQ0KAg0JouIiwiY2xpZW50VHlwZUlkIjoxLCJhdmF0YXIiOiIwZDAwZTFlOC1hM2FkLTQwOGUtYTJkOC03NDM3ZTBlMDgxYTciLCJjb21wYW55IjpbXSwiYWN0aXZlUHJvZmlsZSI6eyJpaW4iOiI5MTA0MTgzMDAzNjMiLCJkaXNwbGF5TmFtZSI6ItCc0JDQndCQ0KAg0JouIiwicHJvZmlsZVBob3RvIjoiMGQwMGUxZTgtYTNhZC00MDhlLWEyZDgtNzQzN2UwZTA4MWE3IiwidHlwZU9mQ2xpZW50IjoxLCJicmFuY2hJZCI6IjE2SSIsImZpcm1JZCI6IjE2IiwiY29uc2VudEV4aXN0cyI6dHJ1ZSwibmVlZFVwZGF0ZVBlcnNvbmFsRGF0YSI6dHJ1ZX19fQ.KizWEY7ijuZ5bUZzzrn07kC_cM5FxvbLGvc7ZO9BgbRf65XZYAdj_Zyk3IXYncFryxoDdzvHSaPqjV95mE8KmUKQ_dhEdbyzJ11kWmOvZrfzc-_kMlSSdo3wObJgvGKOAjZYZLwYANzQBtu0nwOK_oOega2jaP75IHngSk5GxQ9VkugrLpTZPajnmVOqZaVEeQyT1-cUXtZgKsAqqmJyI3lx3ZuMtyEecyjE9REveZ93LVZsFfuyco3P9QCewt12DLm6nEEINxFQKHGEn_qo3MlXhE5uYdByNgWUY1OtGbop0Ne-de7ehf9IvbATEPhFjXJyrQfs_M_K62OUh5HMSA'
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
				initEventSource(response.data.data.applicationID)
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
