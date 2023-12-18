import { Account } from './account'
import { Knp } from './knp'

export interface ExternalForm {
	from: Account | undefined
	iban: ''
	knp: Knp | null
	iin: ''
	name: ''
	amount: number | null
}
