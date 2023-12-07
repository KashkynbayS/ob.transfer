import { Account } from './account'

export interface IbanForm {
	from: Account | undefined
	to: string
    receiverName: string
	amount: string
	transferType: string
}
