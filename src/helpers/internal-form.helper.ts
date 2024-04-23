import { getDataByPhone } from '@/services/phone.service';

import { usePhoneStore } from '@/stores/phone.ts';

import { PhoneForm } from '@/types/phone';
import { validateAccount, validateAmount, validatePhone, validatePhoneNumber } from '@/utils';
import { object } from 'yup';

const phoneStore = usePhoneStore()

const formSchema = object({
	from: validateAccount('from', 'OWN.FORM.ERRORS.SELECT_ACCOUNT'),
	phoneNumber: validatePhone(
		'phone',
		'INTERNAL.PHONE.FORM.ERRORS.ENTER_PHONE_NUMBER',
		'INTERNAL.PHONE.FORM.ERRORS.OWNER_ACCOUNT',
		'INTERNAL.PHONE.FORM.ERRORS.ACCOUNT_NOT_FOUND',
	),
	amount: validateAmount(
		'amount',
		'INTERNAL.PHONE.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'INTERNAL.PHONE.FORM.ERRORS.EMPTY_AMOUNT',
		'INTERNAL.PHONE.FORM.ERRORS.MIN_AMOUNT'
	)
})

const phoneSchema = object({
	phoneNumber: validatePhoneNumber(
		'phone',
		'INTERNAL.PHONE.FORM.ERRORS.OWNER_ACCOUNT',
		'INTERNAL.PHONE.FORM.ERRORS.ACCOUNT_NOT_FOUND',
	),
});

export const validateInternalPhone = (form: PhoneForm) => {
	return formSchema.validate(form, { abortEarly: false, context: { fromAccount: form.from } })
}

export const validateInternalPhoneNumber = (phoneNumber: string) => {
	return phoneSchema.validate({ phoneNumber }, { abortEarly: false });
}

export const handleValidatePhone = async (form: PhoneForm) => {
	try {
		await validateInternalPhoneNumber(form.phoneNumber)
	} catch (error) {
		phoneStore.setValidationError(error)
	}
}

export const handleDataUpdate = async (form: PhoneForm) => {
	form.receiverName = '';
	try {
		if (form.phoneNumber.length === 16) {
			await handleValidatePhone(form);
			const response = await getDataByPhone.get(form.phoneNumber.split(' ').join(''))
			const receiverName = response.name.RU;
			const recIban = response.iban;
			form.receiverName = receiverName;
			form.recIban = recIban;
		}
	} catch (error) {
		console.error('Ошибка при получении данных о получателе:', error)
	}
}

export const handleSelectsUpdate = (value: string) => {
	phoneStore.clearErrors(value)
}

export const toggleShowCard = (form: PhoneForm) => {
	return form.receiverName !== '';
}