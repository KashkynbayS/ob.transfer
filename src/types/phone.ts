import { Account } from './account'

export interface PhoneForm {
	from: Account | undefined
	phoneNumber: string
	receiverName: string
	amount: number | null
	transferType: string
}
