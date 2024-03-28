import axios from 'axios'
import { KnpApiResult } from './../types/knp'

export const KnpService = {
	getList(): Promise<KnpApiResult> {
		return axios
			.get<KnpApiResult>('https://dev-api.kmf.kz/svc/bank/refbook/R_PPC')
			.then((response) => response.data)
			.catch((error) => {
				console.error('Error fetching Knp list:', error)
				throw error
			})
	}
}
