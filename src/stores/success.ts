import { defineStore } from 'pinia'

import { CURRENCY } from '@/types'

export interface DetailsItem {
	name: string
	value: string
	colored?: boolean
}

export interface SuccessStore {
	amount: number
	currency: CURRENCY
	details: DetailsItem[]
}

export const useSuccessStore = defineStore('success', {
	state: (): SuccessStore => ({
		amount: 0,
		currency: CURRENCY.KZT,
		details: []
	}),
	actions: {
		setDetails(amount: number, currency: CURRENCY, details: DetailsItem[]) {
			this.amount = amount
			this.currency = currency
			this.details = details
		}
	}
})
