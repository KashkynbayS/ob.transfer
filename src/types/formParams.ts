export type FormParam = 'iban' | 'recFio' | 'recIin' | 'recIban' | 'recMobileNumber' | 'amount' | 'kbe' | 'paymentPurposes'

export type FormParams = {
	[key in FormParam]?: string
}
