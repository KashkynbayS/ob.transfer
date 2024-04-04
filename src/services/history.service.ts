import { BaseResponse, HistoryItem, HistoryParams } from '@/types'
import axiosInstance from '@/api/api.instance.ts'

export const HistoryService = {
	async fetch(params?: HistoryParams): Promise<HistoryItem[]> {
		const response = await axiosInstance.get<BaseResponse<HistoryItem[]>>('svc/bank/transfers/main/history', {
			params
		})
		return response.data.data
	}
}
