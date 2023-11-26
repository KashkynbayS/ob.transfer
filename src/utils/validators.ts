import { Account } from '@/types'
import { ValidationError, string } from 'yup'

export const validateAmount = (value: string | undefined, fromAccount: Account) => {
	if (!fromAccount || !value) {
		return true
	}

	return fromAccount.amount >= Number(value)
}

export const extractValidationErrors = (сurrent: any, next: any) => {
	const validationErrors = next as ValidationError

	return validationErrors.inner.reduce(
		(acc, e) => {
			acc[e.path as keyof typeof acc] = e.message
			return acc
		},
		{ ...сurrent }
	)
}

export const validateAmountFromAccount = (field: string, errorText: string) =>
	string().test(field, errorText, function (value) {
		const { fromAccount } = this.options.context as { fromAccount: Account }
		return validateAmount(value, fromAccount)
	})
