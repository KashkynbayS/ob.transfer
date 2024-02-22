import { AccountsGroup, CURRENCY } from '@/types'

export const ACCOUNTS_GROUPS: AccountsGroup[] = [
	{
		id: 'my-accounts',
		title: 'ACCOUNTS_GROUPS.MY_ACCOUNTS',
		list: [
			{
				id: 'kzt-account',
				currency: CURRENCY.KZT,
				amount: 389000.01,
				iban: 'KZ59888AA22040000144',
				title: 'ACCOUNTS_GROUPS.ACCOUNT_KZT'
			}
			// {
			// 	id: 'usd-account',
			// 	currency: CURRENCY.USD,
			// 	amount: 457,
			// 	iban: 'KZ123456789012345679',
			// 	title: 'ACCOUNTS_GROUPS.ACCOUNT_USD'
			// }
		]
	},
	{
		id: 'my-deposits',
		title: 'ACCOUNTS_GROUPS.MY_DEPOSITS',
		list: [
			{
				id: 'kzt-deposit',
				currency: CURRENCY.KZT,
				amount: 1345098.45,
				iban: 'KZ59888AA22040000300',
				title: 'ACCOUNTS_GROUPS.DEPOSIT_KZT'
			}
			// {
			// 	id: 'usd-deposit',
			// 	currency: CURRENCY.USD,
			// 	amount: 500,
			// 	iban: 'KZ123456789012345681',
			// 	title: 'ACCOUNTS_GROUPS.DEPOSIT_USD'
			// }
		]
	}
]
