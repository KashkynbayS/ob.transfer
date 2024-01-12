export interface TransferResponse {
	applicationID: string
}

export interface ResendOtpProps extends TransferResponse {
	docType: string
}

export interface CheckOtpProps extends TransferResponse {
	applicationID: string
	otp: number
	docType: string
	subprocess?: boolean
}

export interface CheckOtpResponse {
	noMoreAttempts: boolean
	otpSuccess: boolean
}
