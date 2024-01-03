import { OwnForm } from '@/types'
import { validateAccount, validateAmount, validateWriteOffAmount } from '@/utils'
import { object } from 'yup'

export const formSchema = object({
	from: validateAccount('from', 'OWN.FORM.ERRORS.SELECT_ACCOUNT'),
	to: validateAccount('to', 'OWN.FORM.ERRORS.SELECT_ACCOUNT'),
	amount: validateAmount(
		'amount',
		'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'OWN.FORM.ERRORS.EMPTY_AMOUNT',
		'OWN.FORM.ERRORS.MIN_AMOUNT'
	),
	writeOffAmount: validateWriteOffAmount(
		'writeOffAmount',
		'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'OWN.FORM.ERRORS.EMPTY_AMOUNT',
		'OWN.FORM.ERRORS.MIN_AMOUNT'
	)
})

export const validateOwnForm = async (form: OwnForm) => {
	return formSchema.validate(form, {
		abortEarly: false,
		context: {
			fromAccount: form.from,
			toAccount: form.to,
			isSameCurrency: form.from?.currency === form.to?.currency
		}
	})
}
