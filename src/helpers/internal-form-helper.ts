import { validateAmount, validateReceiverName, validateTo } from '@/utils'
import { object } from 'yup'

export const formSchema = object({
	to: validateTo('to', 'INTERNAL.IBAN.FORM.ERRORS.EMPTY_TO'),
	receiverName: validateReceiverName('receiverName', 'INTERNAL.IBAN.FORM.ERRORS.EMPTY_RECEIVER_NAME'),
	amount: validateAmount(
		'amount',
		'INTERNAL.IBAN.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'INTERNAL.IBAN.FORM.ERRORS.EMPTY_AMOUNT',
		'INTERNAL.IBAN.FORM.ERRORS.MIN_AMOUNT'
	)
})
