import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse, TransactionFromApi } from '@/types'

const { axiosInstance } = useAxiosInstance()

export const HistoryService = {
	async fetch(): Promise<TransactionFromApi[]> {
		const response = await axiosInstance.get<BaseResponse<TransactionFromApi[]>>('main/history')
		return response.data.data
	}
}
