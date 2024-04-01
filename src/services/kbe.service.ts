import useAxiosInstance from '@/api/api.instance'
import { KbeApiResult } from './../types/kbe'

const { axiosInstance } = useAxiosInstance()

export const KbeService = {
	getList(): Promise<KbeApiResult> {
		return axiosInstance.get<KbeApiResult>('svc/bank/refbook/R_BC')
			.then((response) => response.data)
			.catch((error) => {
				console.error('Error fetching Kbe list:', error)
				throw error
			})
	}
}
