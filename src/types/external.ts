import { Account } from './account'
import { Knp } from './knp'

export interface ExternalForm {
	from: Account | undefined
	iban: string
	knp: Knp | null
	iin: string
	receiverName: string
	amount: number | null
}
