import { CURRENCY_SYMBOL } from '@/constants'
import { CURRENCY } from '@/types'

export function maskAmount(amount: number | null = null, currency: CURRENCY = CURRENCY.KZT) {
	const amountString = amount?.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || null
	const currencySymbol = CURRENCY_SYMBOL[currency]

	return amountString ? `${amountString} ${currencySymbol}` : ''
}

export function maskIban(iban: string) {
	return iban.substring(0, 2) + '****' + iban.slice(-4)
}

export function maskPhoneNumber(number: string) {
	const numStr = number.toString();
	return `+7 (${numStr.substring(1, 4)}) ${numStr.substring(4, 7)} ${numStr.substring(7)}`;
}