import axios from 'axios'
import { KbeApiResult } from './../types/kbe'

export const KbeService = {
	getList(): Promise<KbeApiResult> {
		return axios
			.get<KbeApiResult>('https://dev-api.kmf.kz/svc/bank/refbook/R_BC')
			.then((response) => response.data)
			.catch((error) => {
				console.error('Error fetching Kbe list:', error)
				throw error
			})
	}
}
