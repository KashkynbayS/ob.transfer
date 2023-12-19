import { Account } from '@/types'
import { ValidationError, number, object, string } from 'yup'

// Functions of validation From
export const validateFromFunc = (value: object | undefined | null) => !value

// Functions of validation To
export const validateToFunc = (value: string | undefined) => !value

// Functions of validation IBAN
export const validateIbanFunc = (value: string | undefined) => !value

// Functions of validation KNP
export const validateKnpFunc = (value: object | undefined | null) => !value

// Functions of validation IIN
export const validateIinFunc = (value: string | undefined) => !value

// Functions of validation Receiver name
export const validateReceiverNameFunc = (value: string | undefined) => !value

// Functions of validation Amount
export const validateAmountFromAccount = (value: number | undefined | null, fromAccount: Account) => {
	if (!fromAccount || !value) {
		return true
	}
	return fromAccount.amount >= Number(value)
}
export const validateNotEmptyAmount = (value: number | undefined | null) => !value || Number(value) == 0
export const validateMinAmount = (value: number | undefined | null) => value && Number(value) < 100

// extractValidationErrors
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

// Validation From
export const validateFrom = (field: string, errorText: string) =>
	object()
		.test(field, errorText, function (value) {
			return !validateFromFunc(value);
		});

// Validation To
export const validateTo = (field: string, errorText: string) =>
	string()
		.test(field, errorText, function (value) {
			return !validateToFunc(value);
		})

// Validation IBAN
export const validateIban = (field: string, errorText: string) =>
	string()
		.test(field, errorText, function (value) {
			return !validateIbanFunc(value);
		})

// Validation KNP
export const validateKnp = (field: string, errorText: string) =>
	object().nullable()
		.test(field, errorText, function (value) {
			return !validateKnpFunc(value);
		})

// Validation IIN
export const validateIin = (field: string, errorText: string) =>
	string()
		.test(field, errorText, function (value) {
			return !validateIinFunc(value);
		})

// Validation Receiver name
export const validateReceiverName = (field: string, errorText: string) =>
	string()
		.test(field, errorText, function (value) {
			return !validateReceiverNameFunc(value);
		})

// Validation Amount
export const validateAmount = (field: string, errorText1: string, errorText2: string, errorText3: string) =>
	number().nullable()
		.test(field, errorText1, function (value) {
			const { fromAccount } = this.options.context as { fromAccount: Account }
			return validateAmountFromAccount(value, fromAccount);
		})
		.test(field, errorText2, function (value) {
			return !validateNotEmptyAmount(value)
		})
		.test(field, errorText3, function (value) {
			return !validateMinAmount(value)
		});
