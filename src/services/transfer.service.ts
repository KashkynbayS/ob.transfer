import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'
import { IDealsResponse, ITransferRequest, ITransferResponse } from '@/types/transfer'
import { initEventSource } from './sse.service'

const { axiosInstance } = useAxiosInstance()

export const TransferService = {
	async init(body: ITransferRequest): Promise<BaseResponse<ITransferResponse>> {
		const response = await axiosInstance.post<BaseResponse<ITransferResponse>>('/main/init', body)
		return response.data
	},

	async initWithSSE(body: ITransferRequest, callback: (event: MessageEvent<any>) => void): Promise<ITransferResponse> {
		const res = await this.init(body)
		if (res.success) {
			initEventSource(res.data.applicationID, (event) => {
				callback(event)
			})
			console.log("SSE success");

		}

		return res.data
	},

	async fetchDealsList(): Promise<IDealsResponse> {
		const response = await axiosInstance.get<BaseResponse<IDealsResponse>>('https://dev-api.kmf.kz/svc/bank/deals/list')

		return response.data.data
	}
}
