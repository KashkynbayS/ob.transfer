import { KbeApiResult } from './../types/kbe'
import axiosInstance from '@/api/api.instance.ts'

export const KbeService = {
	getList(): Promise<KbeApiResult> {
		return axiosInstance
			.get<KbeApiResult>('svc/bank/refbook/R_BC')
			.then((response) => response.data)
			.catch((error) => {
				console.error('Error fetching Kbe list:', error)
				throw error
			})
	}
}
