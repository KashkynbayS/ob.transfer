import { CURRENCY } from './currency'

export interface Account {
	id: string
	currency: CURRENCY
	title: string
	iban: string
	amount: number
	displayName: string
}

export interface AccountsGroup {
	title: string
	id: string
	list: Account[]
}
