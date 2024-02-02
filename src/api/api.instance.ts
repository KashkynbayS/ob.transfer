import { tokenExpired } from '@ui-kit/events'
import axios from 'axios'

const LS_TOKEN_KEY = 'accessToken'

if (import.meta.env.VITE_ENVIRONMENT === 'local') {
	sessionStorage.setItem(
		LS_TOKEN_KEY,
		'eyJhbGciOiJSUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOdkpSQ1VtVkd5UnZBbTF3aFcwZWxleEFVSnJUNFpCeTBRTFI3YXBZQV9vIn0.eyJleHAiOjE3MDYyNDI4NzQsImlhdCI6MTcwNjI0MTk3NCwianRpIjoiOWJiZDhkMmItYzY5My00NjNiLWI0MTctMGYxNTk4MTQ2MzU4IiwiaXNzIjoiaHR0cHM6Ly9pZC1kZXYua21mLmt6L3JlYWxtcy9vbmxpbmUtYmFuayIsInN1YiI6ImFjZDRkNWQ3LWUxMDAtNDUwOS1hODQ5LTAxM2MxYWQ3MDM0YiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFjY291bnQiLCJzZXNzaW9uX3N0YXRlIjoiN2JkOGViMTMtM2EyOS00M2ZjLTk4MzUtOWIwYzEyZjllNjM5Iiwic2NvcGUiOiJwaG9uZSIsInNpZCI6IjdiZDhlYjEzLTNhMjktNDNmYy05ODM1LTliMGMxMmY5ZTYzOSIsInBlcnNvbmFsIjp7InByb2ZpbGUiOnsiZmlybUlkIjoiMTciLCJicmFuY2hJZCI6IjE0MyIsIm5hbWUiOiLQk9CV0J7QoNCT0JjQmSDQky4iLCJwaG9uZSI6Iis3Nzc3NTEwOTQ0NyIsImlpbiI6Ijg3MTIwOTMwMTEzNiIsInNjb3BlIjpbXX0sImNvbHZpciI6eyJpZCI6MCwiZGVwSWQiOjAsImNvZGUiOiIifSwidHlwZUlkIjoxfX0.dl2pUFryoC6VodPJE9Y6yfpxatYC8TGne0HfPwDYa4B5nlTHolMmOq_ME1VcQMScw2kyjD0AimF4iHXHE4ZmoyrUO3pwWIwZ6luGnmdjEuxxSo21AiGv9_zDf3-kCJ3IXDXRwgqPDvbc-0JLhf2IDni7f6iNuaH6swSzkdAkckf6YS7Q1OudTrGDOm0fy_zZnUWmVpgqWnYX2N-BeBGlrTX7hDCsrWmQkqKxUWS7XacGUomw5JJf5KqypanIzdRq0nQDml8bnQi7lC_5Mdyzk3svpqnu9vNAEGA-yPjwHY-dWncCiBLZH2OjsSndYgGQQi4dFCxgxqforyIqoAlkpA'
	)
}

const getAccessToken = (): string => `Bearer ${sessionStorage.getItem(LS_TOKEN_KEY) || ''}`

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

			return Promise.reject(error)
		}
	)

	return { axiosInstance }
}
