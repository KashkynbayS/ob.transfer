export type FormParam = 'iban' | 'recFio' | 'recIin' | 'recIban' | 'recMobileNumber' | 'amount' | 'kbe'

export type FormParams = {
	[key in FormParam]?: string
}
