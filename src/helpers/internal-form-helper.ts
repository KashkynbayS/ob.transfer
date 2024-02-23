import { IbanForm } from '@/types/iban'
import { validateAmount, validateKnp, validatePaymentPurposes, validateReceiverName, validateTo } from '@/utils'
import { object } from 'yup'


export const formSchema = object({
	to: validateTo('to', 'INTERNAL.IBAN.FORM.ERRORS.EMPTY_TO'),
	receiverName: validateReceiverName('receiverName', 'INTERNAL.IBAN.FORM.ERRORS.EMPTY_RECEIVER_NAME'),
	knp: validateKnp('knp', 'KNP.TITLE'),
	paymentPurposes: validatePaymentPurposes('paymentPurposes', 'INTERNAL.IBAN.FORM.PAYMENT_PURPOSES'),
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
				fromAccount: form.from 
			} 
		})
}