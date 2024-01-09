import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse, HistoryParams, TransactionFromApi } from '@/types'

const { axiosInstance } = useAxiosInstance()

export const HistoryService = {
	async fetch(params?: HistoryParams): Promise<TransactionFromApi[]> {
		const response = await axiosInstance.get<BaseResponse<TransactionFromApi[]>>('main/history', {
			params
		})
		return response.data.data
	}
}
