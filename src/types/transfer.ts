//TODO clarify types from backenders
export enum TypeOfTransfer {
	BetweenMyAccountsConversionUSD = 1,
	BetweenMyAccountsDepositReplenishment = 5,
	BetweenMyAccountsWithdrawalFromDeposit = 6,
	InternalByPhone = 2,
	InternalByAccount = 3,
	External = 4,

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
	id?: string
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
