import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'

const { axiosInstance } = useAxiosInstance()

export const getFrequents = {
	async fetch(): Promise<any> {
		const response = await axiosInstance.get<BaseResponse<any>>('main/favorite')
		return response.data.data
	}
}
