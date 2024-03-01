import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse, HistoryItem, HistoryParams } from '@/types'

const { axiosInstance } = useAxiosInstance()

export const HistoryService = {
	async fetch(params?: HistoryParams): Promise<HistoryItem[]> {
		const response = await axiosInstance.get<BaseResponse<HistoryItem[]>>('main/history', {
			params
		})
		return response.data.data
	}
}
