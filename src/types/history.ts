import { CURRENCY } from '@/types/index.ts'

export type TransactionsType = 'fill' | 'payment' | 'transferByAccount' | 'transferByPhone'
export type TransactionStatus = 'credited' | 'removed' | 'waiting' | 'transferred'

export interface Transaction {
	type: TransactionsType
	currency: CURRENCY
	caption: string
	value: number
	commission?: number
	id: string
	status: TransactionStatus
}

export interface TransactionGroup {
	title: string
	list: Transaction[]
}

export interface Tag {
	title: string
	value: string
	type?: TAG_TYPE
}

export enum TAG_TYPE {
	DATE = 'DATE'
}
