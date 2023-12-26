import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'

const { axiosInstance } = useAxiosInstance()

export const HistoryService = {
	async fetch(): Promise<any> {
		const response = await axiosInstance.get<BaseResponse<any>>('main/history')
		return response.data.data
	}
}
