import { HistoryFilter } from '@/stores/history.ts'
import { CURRENCY } from '@/types/index.ts'
import { TypeOfTransfer } from '@/types/transfer.ts'

export type TransactionStatus = 'success' | 'in_progress' | 'waiting' | 'credited' | 'removed' | 'rejected'

export interface Transaction {
	type: TypeOfTransfer
	currency: CURRENCY
	caption: string
	value: number
	commission?: number
	id: string
	status: TransactionStatus
}

export interface HistoryItem {
	amount: number;
	bin?: string;
	commission?: string;
	createdAt: Date;
	iban?: string;
	id: string;
	kbe?: string;
	knp?: string;
	recBin?: string;
	recCompany?: string;
	recFio?: string;
	recIban?: string;
	recIin?: string;
	recMobileNumber?: string;
	receiptNumber?: string;
	status: TransactionStatus;
	transferDescription?: string;
	typeOfTransfer: number;
}

export interface TransactionGroup {
	title: string
	isTitleWithTranslation: boolean
	list: Transaction[]
}

export interface HistoryGroup {
	title: string
	isTitleWithTranslation: boolean
	list: HistoryItem[]
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
	receiptNumber: string
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

export interface HistoryParams {
	startDate?: string
	endDate?: string
	minAmount?: string
	maxAmount?: string
	limit?: number
	status?: HistoryFilter
	offset?: number
	sortField?: 'created_at' | 'amount' | 'status'
	sortOrder?: 'asc' | 'desc'
}
