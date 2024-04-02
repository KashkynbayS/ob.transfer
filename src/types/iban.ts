import { Account } from './account'
import { Knp } from './knp'

export interface IbanForm {
	from: Account | undefined
	to: string
	receiverName: string
	knp: Knp | string | null,
	paymentPurposes: string,
	amount: string | null
}
