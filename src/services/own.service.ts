import { CURRENCY, Rate } from '@/types'

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
	}
}
