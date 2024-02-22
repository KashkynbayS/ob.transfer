import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'
import { ExternalForm } from './../types/external'

const { axiosInstance } = useAxiosInstance()

export const ExternalService = {
	transfer(form: ExternalForm): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				console.log(form)
				resolve()
			}, 1000)
		})
	}
}

export const getFioByIin = {
    async post(iin: string): Promise<any> {
        try {
            const response = await axiosInstance.post<BaseResponse<any>>('main/iin-check', { iin });
            console.log("hiiiii");
            return response.data.data;
            
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            throw error;
        }
    },
}
