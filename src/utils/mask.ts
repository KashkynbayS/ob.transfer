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

	let suffix = '';

	if (numStr.length === 11) {
		suffix = '+';
	} else if (numStr.length === 10) {
		suffix = '+7';
	}

	if (numStr.length > 10) {
		return `${numStr.substring(0, 2)} (${numStr.substring(2, 5)}) ${numStr.substring(5, 8)} ${numStr.substring(8)}`;
	}

	return numStr;
}

// export function formatIban(input: string): string {
// 	if (input.length !== 20) {
// 		return input;
// 	}

// 	return input.match(/.{1,4}/g)?.join(" ") || "";
// }
