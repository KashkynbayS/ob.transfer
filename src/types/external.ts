import { Account } from './account'
import { Knp } from './knp'

export interface ExternalForm {
	from: Account | undefined
	iban: string
	knp: Knp | string | null
	iin: string
	receiverName: string
	amount: number | null
	paymentPurposes: string
}
