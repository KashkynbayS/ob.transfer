import { Account } from './account'

export enum LAST_UPDATED {
	WRITE_OFF_AMOUNT = 'writeOffAmount',
	ENROLLMENT_AMOUNT = 'enrollmentAmount'
}

export interface OwnForm {
	from: Account | undefined
	to: Account | undefined
	amount: number | null
	writeOffAmount: string
	enrollmentAmount: string
	lastUpdated: LAST_UPDATED | undefined,
	transferType: string,
	receiverName: string
}
