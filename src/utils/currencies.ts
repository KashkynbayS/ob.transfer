import { Account, CURRENCY } from '@/types'

const currencies = {
	[CURRENCY.KZT]: 'OWN.CURRENCIES.KZT',
	[CURRENCY.USD]: 'OWN.CURRENCIES.USD'
}

export function extractCurrencyFromAmount(account: Account | undefined) {
	return account ? currencies[account.currency] : ''
}
