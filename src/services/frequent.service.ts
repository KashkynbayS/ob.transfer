import { BaseResponse } from '@/types'
import axiosInstance from '@/api/api.instance.ts'

export const getFrequents = {
	async fetch(): Promise<any> {
		const response = await axiosInstance.get<BaseResponse<any>>('svc/bank/transfers/main/favorite')
		return response.data.data
	}
}

export const addToFavorites = async (applicationID: string): Promise<any> => {
	try {
		const response = await axiosInstance.post<BaseResponse<any>>('svc/bank/transfers/main/favorite', { applicationID })
		return response.data.data
	} catch (error) {
		console.error('Ошибка при добавлении в избранное:', error)
		throw error
	}
}

export const removeFromFavorites = async (applicationID: string): Promise<void> => {
	try {
		await axiosInstance.delete<BaseResponse<void>>(`svc/bank/transfers/main/favorite?applicationID=${applicationID}`)
	} catch (error) {
		console.error('Ошибка при удалении из избранного:', error)
		throw error
	}
}
