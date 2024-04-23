import { object } from 'yup';

import { getFIOByIban } from '@/services/iban.service';

import { useIbanStore } from '@/stores/iban.ts';

import { validateAccount, validateAmount, validateTo } from '@/utils';

import { IbanForm } from '@/types/iban';

const IbanStore = useIbanStore()

export const formSchema = object({
	from: validateAccount('from', 'OWN.FORM.ERRORS.SELECT_ACCOUNT'),
	to: validateTo(
		'to',
		'INTERNAL.IBAN.FORM.ERRORS.EMPTY_TO',
		'INTERNAL.IBAN.FORM.ERRORS.ACCOUNT_NOT_FOUND'
	),
	// knp: validateKnp('knp', 'KNP.TITLE'),
	// paymentPurposes: validatePaymentPurposes('paymentPurposes', 'INTERNAL.IBAN.FORM.PAYMENT_PURPOSES'),
	amount: validateAmount(
		'amount',
		'INTERNAL.IBAN.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'INTERNAL.IBAN.FORM.ERRORS.EMPTY_AMOUNT',
		'INTERNAL.IBAN.FORM.ERRORS.MIN_AMOUNT'
	)
})

export const handleKnpUpdate = () => {
	IbanStore.clearErrors('knp')
}

export const handleSelectsUpdate = (value: string) => {
	IbanStore.clearErrors(value)
}

export const validateInternalIban = (form: IbanForm) => {
	return formSchema.validate(form, {
		abortEarly: false,
		context: {
			fromAccount: form.from,
			toAccount: form.to,
		}
	})
}

export const handleNameUpdate = async (form: IbanForm) => {

	console.log('form.receiverName: ', form.receiverName);

	form.receiverName = '';

	try {
		if (form.to.length === 20) {
			const response = await getFIOByIban.get(form.to.split(' ').join(''))
			const receiverName = response.name.RU;
			form.receiverName = receiverName;
		}
	} catch (error) {
		console.error('Ошибка при получении данных о получателе:', error)
	}
}

export const toggleShowCard = (form: IbanForm) => {
	return form.receiverName !== '';
}