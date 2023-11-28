import { CURRENCY } from './currency'

export interface Rate {
	from: {
		currency: CURRENCY
		amount: number
	}
	to: {
		currency: CURRENCY
		amount: number
	}
}
