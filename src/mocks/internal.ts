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
				iban: 'KZ57888AM22030000002',
				title: 'Счёт KZT'
			},
			{
				id: 'KZT-account',
				currency: CURRENCY.KZT,
				amount: 457,
				iban: 'KZ123456789012345679',
				title: 'Счёт KZT'
			}
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
			},
			{
				id: 'KZT-deposit',
				currency: CURRENCY.KZT,
				amount: 500,
				iban: 'KZ123456789012345681',
				title: 'Депозит KZT'
			}
		]
	}
]
