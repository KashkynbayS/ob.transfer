import { Account } from './account'
import { Kbe } from './kbe'
import { Knp } from './knp'

export interface ExternalForm {
	from: Account | undefined
	iban: string
	kbe: Kbe | string | null
	knp: Knp | string | null
	iin: string
	receiverName: string
	amount: number | null
	paymentPurposes: string
}
