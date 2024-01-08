//TODO clarify types from backenders
export enum TypeOfTransfer {
	BetweenMyAccounts = 1,
	Internal = 2,
	External = 3
}

export enum TransferState {
	InProgress = 'in_progress'
}

// Looks like only iban, recIban, amount and typeOfTransfer are mandatory
export interface ITransferRequest {
	bin?: string
	iban: string
	iin?: string
	kbe?: string
	knp?: string
	recBin?: string
	recFio?: string
	recIban?: string
	recIin?: string
	recMobileNumber?: string
	transferDescription?: string
	amount: string
	typeOfTransfer: TypeOfTransfer
}

export interface ITransferResponse {
	applicationID: string
	applicationStatus: TransferState
}
