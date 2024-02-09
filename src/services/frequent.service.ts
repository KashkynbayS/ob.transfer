import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'

const { axiosInstance } = useAxiosInstance()

export const getFrequents = {
	async fetch(): Promise<any> {
		const response = await axiosInstance.get<BaseResponse<any>>('main/favorite')
		return response.data.data
	}
}

export const addToFavorites = {
    async post(applicationID: string): Promise<any> {
        try {
            const response = await axiosInstance.post<BaseResponse<any>>('main/favorite', { applicationID });
            return response.data.data;
        } catch (error) {
            console.error('Ошибка при добавлении в избранное:', error);
            throw error;
        }
    },
}

export const removeFromFavorites = {
    async delete(applicationID: string): Promise<void> {
        try {
            await axiosInstance.delete<BaseResponse<void>>(`main/favorite?applicationID=${applicationID}`);
        } catch (error) {
            console.error('Ошибка при удалении из избранного:', error);
            throw error;
        }
    },
};