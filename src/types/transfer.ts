//TODO clarify types from backenders

export enum TypeOfTransfer {
	BetweenMyAccountsConversionUSD = 1,
	BetweenMyAccountsDepositReplenishment = 5,
	BetweenMyAccountsWithdrawalFromDeposit = 6,
	InternalByPhone = 2,
	InternalByAccount = 3,
	External = 4
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
	paymentPurposes?: string
	transferDescription?: string
	depositNumber?: string
	amount: string
	typeOfTransfer: TypeOfTransfer
}

export interface ITransferResponse {
	applicationID: string
	applicationStatus: TransferState
}

export interface ILoan {
	id: 'mock-123'
	number: '#CLVR123'
	type: {
		id: 1
		name: 'Кредит онлайн'
	}
	amount: 654321
	term: 21
	paymentDate: '2024-02-19T16:46:37.444081398+06:00'
	issueDate: '2024-02-19T16:46:37.444081461+06:00'
	link: 'https://online-dev.kmf.kz/app/bank/loan'
	firmId: '10'
	branchId: '10A'
	paidMonthes: 5
	icon: {
		color: '#ED1307'
		chars: '21'
	}
	displayName: 'Кредит онлайн'
}

export interface IAccount {
	id: string
	type: {
		id: number
		name: string
	}
	amount: number
	accNumber: string
	maskerNumber: string
	currency: {
		id: number
		name: string
	}
	link: string
	firmId: string
	branchId: string
	icon: {
		color: string
		chars: string
	}
	blocked: boolean
	displayName: string
}

export interface ILink {
	type: 'loan' | 'deposit' | 'account'
	title: string
	link: string
}

export interface IDealsResponse {
	loans: ILoan[]
	deposits: []
	accounts: IAccount[]
	links: ILink[]
}
