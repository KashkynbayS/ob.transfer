export * from './formParams.ts'
export * from './history.ts'

export enum CURRENCY {
	KZT = 'kzt',
	USD = 'usd'
}

export const CURRENCY_SYMBOL = {
	[CURRENCY.KZT]: '₸',
	[CURRENCY.USD]: '$'
}

export interface Account {
	id: string
	currency: CURRENCY
	title: string
	iban: string
	amount: number
}

export interface AccountsGroup {
	title: string
	id: string
	list: Account[]
}

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
