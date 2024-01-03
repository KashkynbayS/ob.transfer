import { useLoadingStore } from '@/stores/loading.ts'
import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDQyNTE2MTQsImlhdCI6MTcwNDI1MDcxNCwianRpIjoiYTkyODJkNDktN2JiZi00MmU0LTk3NDgtZGFhZTM1ZjE1NTcyIiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImI2NTI2N2NiLTE5ZDktNGEzNC04NzE4LTNkNTEwZWEwMTljZiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiZjc5NTI4YTctNTI3My00NmUwLTgwYWUtN2RmMTRjMzQxYjg0Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6ImY3OTUyOGE3LTUyNzMtNDZlMC04MGFlLTdkZjE0YzM0MWI4NCIsInBlcnNvbmFsIjp7ImN1c3RvbWVySWQiOiJiNjUyNjdjYi0xOWQ5LTRhMzQtODcxOC0zZDUxMGVhMDE5Y2YiLCJwaG9uZU5vIjoiKzc3MDUzMjM3MTU5IiwibmFtZSI6ItCV0JLQk9CV0J3QmNCZINCdLiIsImNsaWVudFR5cGVJZCI6MSwiYXZhdGFyIjoiIiwiY29tcGFueSI6W3siYmluIjoiMDYxMjQwMDAxNTgzIiwibmFtZSI6ItCi0J7QniBcItCc0LjQutGA0L7RhNC40L3QsNC90YHQvtCy0LDRjyDQvtGA0LPQsNC90LjQt9Cw0YbQuNGPIFwiS01GICjQmtCc0KQpXCIiLCJjbGllbnRUeXBlSWQiOjMsImFjdGl2ZSI6dHJ1ZSwibG9nb3R5cGUiOiIifSx7ImJpbiI6IjA2MTI0MDAwMTU4MyIsIm5hbWUiOiLQotCe0J4gXCLQnNC40LrRgNC-0YTQuNC90LDQvdGB0L7QstCw0Y8g0L7RgNCz0LDQvdC40LfQsNGG0LjRjyBcIktNRiAo0JrQnNCkKVwiIiwiY2xpZW50VHlwZUlkIjozLCJhY3RpdmUiOnRydWUsImxvZ290eXBlIjoiIn0seyJiaW4iOiIwNjEyNDAwMDE1ODMiLCJuYW1lIjoi0KLQntCeIFwi0JzQuNC60YDQvtGE0LjQvdCw0L3RgdC-0LLQsNGPINC-0YDQs9Cw0L3QuNC30LDRhtC40Y8gXCJLTUYgKNCa0JzQpClcIiIsImNsaWVudFR5cGVJZCI6MywiYWN0aXZlIjp0cnVlLCJsb2dvdHlwZSI6IiJ9LHsiYmluIjoiMDYxMjQwMDAxNTgzIiwibmFtZSI6ItCi0J7QniBcItCc0LjQutGA0L7RhNC40L3QsNC90YHQvtCy0LDRjyDQvtGA0LPQsNC90LjQt9Cw0YbQuNGPIFwiS01GICjQmtCc0KQpXCIiLCJjbGllbnRUeXBlSWQiOjMsImFjdGl2ZSI6dHJ1ZSwibG9nb3R5cGUiOiIifSx7ImJpbiI6IjA2MTI0MDAwMTU4MyIsIm5hbWUiOiLQotCe0J4gXCLQnNC40LrRgNC-0YTQuNC90LDQvdGB0L7QstCw0Y8g0L7RgNCz0LDQvdC40LfQsNGG0LjRjyBcIktNRiAo0JrQnNCkKVwiIiwiY2xpZW50VHlwZUlkIjozLCJhY3RpdmUiOnRydWUsImxvZ290eXBlIjoiIn1dLCJhY3RpdmVQcm9maWxlIjp7ImlpbiI6Ijk5MDUxMjA1MDQzMSIsImRpc3BsYXlOYW1lIjoi0JXQktCT0JXQndCY0Jkg0J0uIiwicHJvZmlsZVBob3RvIjoiIiwidHlwZU9mQ2xpZW50IjoxLCJicmFuY2hJZCI6IjEwQSIsImZpcm1JZCI6IjEwIiwiY29uc2VudEV4aXN0cyI6dHJ1ZSwibmVlZFVwZGF0ZVBlcnNvbmFsRGF0YSI6dHJ1ZX19fQ.q7NJaC14xXSHjMCNUIBXZVT5hUYIiqqjgQhIJc8CM_9fXcbnLVzD9SzaCbbBlMV8hVElsc8EO-0JBGPX-o2uStMfJAc6FW_bsFN0I7hZxaLH5s_q9R0yAFevfRYFi9djji-PtQJMLVi_EtfLJvdqRQDOLh5LxoQ2tUVRis-6xrngat5MKJt9bnE-JLcbDuyKVR0E19wH5Cs1zQuYW7942DiUXMH311yaXtSVg3qSMqiHdd_DxIlDARc0PuXFAWvCg-HeAqGlMzYP_HgdJnSIfPUKqNKx3Iqs5KJQnPLnL8zi8kqTFhnxNo2nthXo_myFYk0BPvo3ylc8tu3E4Bkj2A'
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
