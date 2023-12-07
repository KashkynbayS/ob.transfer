import { IbanForm } from './../types/iban'

export const IbanService = {
	transfer(form: IbanForm): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				console.log(form)
				resolve()
			}, 1000)
		})
	}
}
