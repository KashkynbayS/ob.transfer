import { Account } from '@/types';
import { ValidationError, object, string } from 'yup';

import { getFIOByIban } from '@/services/iban.service';
import { getDataByPhone } from '@/services/phone.service';
import { TransferService } from '@/services/transfer.service';


// Functions of validation From
export const validateAccountFunc = (value: object | undefined | null) => !value

// Functions of validation To
export const validateToFuncEmpty = (value: string | undefined) => !value

export const validateToFuncAccNotFound = async (value: string | undefined) => {
	if (!value) return true;

	try {
		const result = await getFIOByIban.get(value);
		return result.iban;

	} catch (error) {
		console.error('Произошла ошибка при проверке поля TO:', error);
		return false;
	}
}

// Functions of validation Phone
export const validatePhoneEmpty = (value: string | undefined) => !value

export const validatePhoneAccNotFound = async (value: string | undefined) => {
	if (!value) return true;

	try {
		const result = await getDataByPhone.get(value.split(' ').join(''));
		console.log('result.iban: ' + result.iban);

		return !!result.iban;

	} catch (error) {
		console.error('Произошла ошибка при проверке поля Phone:', error);
		return false;
	}
}

export const validatePhoneOwnerAccount = async (value: string | undefined) => {
	if (!value) return true;

	try {
		const result = await getDataByPhone.get(value.split(' ').join(''));
		const deals = await TransferService.fetchDealsList()
		console.log('deals.accounts[0].accNumber: ' + deals.accounts[0].accNumber);

		return result.iban !== deals.accounts[0].accNumber;

	} catch (error) {
		console.error('Произошла ошибка при проверке поля Phone:', error);
		return false;
	}
}
// Functions of validation IBAN
export const validateIbanFunc = (value: string | undefined) => !value

// Functions of validation KBE
export const validateKbeFunc = (value: object | undefined | null) => !value

// Functions of validation KNP
export const validateKnpFunc = (value: object | undefined | null) => !value

// Functions of validation PaymentPurposes
export const validatePaymentPurposesFunc = (value: string | undefined) => !value

// Functions of validation IIN
export const validateIinFunc = (value: string | undefined) => !value

// Functions of validation Receiver name
export const validateReceiverNameFunc = (value: string | undefined) => !value

// Functions of validation Amount
export const validateAmountFromAccount = (value: string | undefined | null, fromAccount: Account) => {
	if (!fromAccount || !value) {
		return true
	}
	return fromAccount.amount >= Number(value)
}
export const validateNotEmptyAmount = (value: string | undefined | null) => !value || Number(value) === 0

export const validateMinAmount = (value: string | undefined | null) => value && Number(value) < 100

export const validateIsSameCurrency = (value: { fromAccount: Account; toAccount: Account }) =>
	value?.fromAccount?.currency === value?.toAccount?.currency

// Functions of validation WriteOffAmount
export const validateWriteOffAmountFromAccount = (value: string | undefined | null, fromAccount: Account) => {
	if (!fromAccount || !value) {
		return true
	}
	return fromAccount.amount >= Number(value)
}
export const validateNotEmptyWriteOffAmount = (value: string | undefined | null) => !value || Number(value) == 0

export const validateMinWriteOffAmount = (value: string | undefined | null) => value && Number(value) < 100

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
export const validateAccount = (field: string, errorText: string) =>
	object()
		.nullable()
		.test(field, errorText, function (value) {
			return !validateAccountFunc(value)
		})

// Validation To
export const validateTo = (field: string, errorText1: string, errorText2: string) =>
	string()
		.test(field, errorText1, function (value) {
			return !validateToFuncEmpty(value);
		})
		.test(field, errorText2, function (value) {
			return validateToFuncAccNotFound(value);
		});

// Validation PHONE
export const validatePhone = (field: string, errorText1: string, errorText2: string, errorText3: string) =>
	string()
		.test(field, errorText1, function (value) {
			return !validatePhoneEmpty(value);
		})
		.test(field, errorText2, function (value) {
			return validatePhoneOwnerAccount(value);
		})
		.test(field, errorText3, function (value) {
			return validatePhoneAccNotFound(value);
		})

// Validation IBAN
export const validateIban = (field: string, errorText: string) =>
	string().test(field, errorText, function (value) {
		return !validateIbanFunc(value)
	})

// Validation KBE
export const validateKbe = (field: string, errorText: string) =>
	object()
		.nullable()
		.test(field, errorText, function (value) {
			return !validateKbeFunc(value)
		})

// Validation KNP
export const validateKnp = (field: string, errorText: string) =>
	object()
		.nullable()
		.test(field, errorText, function (value) {
			return !validateKnpFunc(value)
		})

// Validation Receiver name
export const validatePaymentPurposes = (field: string, errorText: string) =>
	string().test(field, errorText, function (value) {
		return !validatePaymentPurposesFunc(value)
	})

// Validation IIN
export const validateIin = (field: string, errorText: string) =>
	string().test(field, errorText, function (value) {
		return !validateIinFunc(value)
	})

// Validation Receiver name
export const validateReceiverName = (field: string, errorText: string) =>
	string().test(field, errorText, function (value) {
		return !validateReceiverNameFunc(value)
	})

// Validation Amount
export const validateAmount = (field: string, errorText1: string, errorText2: string, errorText3: string) =>
	string()
		// .nullable()
		.test(field, errorText1, function (value) {
			const { fromAccount } = this.options.context as { fromAccount: Account }
			return validateAmountFromAccount(value, fromAccount)
		})
		.test(field, errorText2, function (value) {
			return !validateNotEmptyAmount(value)
		})
		.test(field, errorText3, function (value) {
			return !validateMinAmount(value)
		})

// Validation WriteOffAmount
export const validateWriteOffAmount = (field: string, errorText1: string, errorText2: string, errorText3: string) =>
	string()
		.test(field, errorText1, function (value) {
			const data = this.options.context as { fromAccount: Account; toAccount: Account }

			if (validateIsSameCurrency(data)) return true
			return validateWriteOffAmountFromAccount(value, data.fromAccount)
		})
		.test(field, errorText2, function (value) {
			if (validateIsSameCurrency(this.options.context as { fromAccount: Account; toAccount: Account })) return true
			return !validateNotEmptyWriteOffAmount(value)
		})
		.test(field, errorText3, function (value) {
			if (validateIsSameCurrency(this.options.context as { fromAccount: Account; toAccount: Account })) return true
			return !validateMinWriteOffAmount(value)
		})
