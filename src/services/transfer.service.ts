import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'
import { ITransferRequest, ITransferResponse } from '@/types/transfer'
import { initEventSource } from './sse.service'

const { axiosInstance } = useAxiosInstance()
// const SSE_BASE_URL = 'https://dev-api.kmf.kz/svc/go-redis-sse/events?stream='

export const TransferService = {
	async init(body: ITransferRequest): Promise<BaseResponse<ITransferResponse>> {
		const response = await axiosInstance.post<BaseResponse<ITransferResponse>>('/main/init', body)
		return response.data
	},

	async initWithSSE(body: ITransferRequest, callback: (event: MessageEvent<any>) => void): Promise<ITransferResponse> {
		const res = await this.init(body)
		if (res.success) {
			initEventSource(res.data.applicationID, callback)
		}

		return res.data
	}
}

// export const initEventSource = (uuidValue: string, callback: SseMessageCallback) => {
// 	const eventSource = ref<EventSource | null>(null)

// 	if (eventSource.value) {
// 		eventSource.value.close()
// 	}

// 	eventSource.value = new EventSource(SSE_BASE_URL + uuidValue)

// 	eventSource.value.onmessage = (event) => {
// 		console.log('SSE message', event, JSON.parse(event.data) as any)
// 		return callback(JSON.parse(event.data) as any)
// 	}

// 	eventSource.value.onopen = (event) => {
// 		console.log('SSE is opened', event)
// 	}
// }
