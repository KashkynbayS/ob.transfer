import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'
import { IbanForm } from './../types/iban'

const { axiosInstance } = useAxiosInstance()

export const IbanService = {
	transfer(form: IbanForm): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				console.log(form)
				resolve()
			}, 1000)
		})
	}
}

export const getFIOByIban = {
	async get(iban: string): Promise<any> {
		try {
			const response = await axiosInstance.get<BaseResponse<any>>(`/main/recipients/by-iban/${iban}`);
			return response.data.data;

		} catch (error) {
			console.error('Ошибка при выполнении запроса:', error);
			throw error;
		}
	},
}