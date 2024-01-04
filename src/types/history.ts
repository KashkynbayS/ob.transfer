import { CURRENCY } from '@/types/index.ts'
import { TypeOfTransfer } from '@/types/transfer.ts'

export type TransactionStatus = 'success' | 'in_progress'

export interface Transaction {
	type: TypeOfTransfer
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

export interface TransactionFromApi {
	recMobileNumber: string
	transferDescription: string
	amount: number
	recIban: string
	bin: string
	knp: string
	kbe: string
	createdAt: string
	recBin: string
	iban: string
	recFio: string
	commission: string
	id: string
	recIin: string
	typeOfTransfer: number
	status: TransactionStatus
}

export interface Tag {
	title: string
	value: string
	type?: TAG_TYPE
}

export enum TAG_TYPE {
	DATE = 'DATE'
}
