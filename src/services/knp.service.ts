import useAxiosInstance from '@/api/api.instance'
import { KnpApiResult } from './../types/knp'

const { axiosInstance } = useAxiosInstance()

export const KnpService = {
	getList(): Promise<KnpApiResult> {
		return axiosInstance
			.get<KnpApiResult>('svc/bank/refbook/R_PPC')
			.then((response) => response.data)
			.catch((error) => {
				console.error('Error fetching Knp list:', error)
				throw error
			})
	}
}
