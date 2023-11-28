import { ExternalForm } from './../types/external'

export const ExternalService = {
	transfer(form: ExternalForm): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				console.log(form)
				resolve()
			}, 1000)
		})
	}
}
