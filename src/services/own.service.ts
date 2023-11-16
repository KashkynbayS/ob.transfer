import { CURRENCY, Rate } from '@/types'
import { OwnForm } from './../types/own'

export const OwnService = {
	fetchRate(): Promise<Rate> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					from: {
						currency: CURRENCY.KZT,
						amount: 480
					},
					to: {
						currency: CURRENCY.USD,
						amount: 1
					}
				})
			}, 1000)
		})
	},

	transferOwn(form: OwnForm): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				console.log(form)
				resolve()
			}, 1000)
		})
	}
}
