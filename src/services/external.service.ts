import { BaseResponse } from '@/types'
import { ExternalForm } from './../types/external'
import axiosInstance from '@/api/api.instance.ts'

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
			const response = await axiosInstance.post<BaseResponse<any>>('svc/bank/transfers/main/iin-check', { iin })
			return response.data.data
		} catch (error) {
			console.error('Ошибка при выполнении запроса:', error)
			throw error
		}
	}
}
