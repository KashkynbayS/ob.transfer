import { AccountsGroup, CURRENCY } from '@/types'

export const ACCOUNTS_GROUPS: AccountsGroup[] = [
	{
		id: 'my-accounts',
		title: 'Мои счета',
		list: [
			{
				id: 'kzt-account',
				currency: CURRENCY.KZT,
				amount: 389000.01,
				iban: 'KZ123456789012345678',
				title: 'Счёт KZT'
			}
			// {
			// 	id: 'usd-account',
			// 	currency: CURRENCY.USD,
			// 	amount: 457,
			// 	iban: 'KZ123456789012345679',
			// 	title: 'Счёт USD'
			// }
		]
	},
	{
		id: 'my-deposits',
		title: 'Мои депозиты',
		list: [
			{
				id: 'kzt-deposit',
				currency: CURRENCY.KZT,
				amount: 1345098.45,
				iban: 'KZ123456789012345680',
				title: 'Депозит KZT'
			}
			// {
			// 	id: 'usd-deposit',
			// 	currency: CURRENCY.USD,
			// 	amount: 500,
			// 	iban: 'KZ123456789012345681',
			// 	title: 'Депозит USD'
			// }
		]
	}
]
