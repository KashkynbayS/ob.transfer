import { PhoneForm } from './../types/phone'

export const PhoneService = {
	transfer(form: PhoneForm): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				console.log(form)
				resolve()
			}, 1000)
		})
	}
}
