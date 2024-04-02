import { IbanForm } from '@/types/iban'
import { validateAccount, validateAmount, validateTo } from '@/utils'
import { object } from 'yup'


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

export const validateInternalIban = (form: IbanForm) => {
	return formSchema.validate(form, {
		abortEarly: false,
		context: {
			fromAccount: form.from,
			toAccount: form.to,
		}
	})
}