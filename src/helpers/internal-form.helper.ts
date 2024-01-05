import { PhoneForm } from '@/types/phone'
import { validateAmount } from '@/utils'
import { object } from 'yup'

const formSchema = object({
	amount: validateAmount(
		'amount',
		'INTERNAL.PHONE.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'INTERNAL.PHONE.FORM.ERRORS.EMPTY_AMOUNT',
		'INTERNAL.PHONE.FORM.ERRORS.MIN_AMOUNT'
	)
})

export const validateInternalPhone = (form: PhoneForm) => {
	return formSchema.validate(form, { abortEarly: false, context: { fromAccount: form.from } })
}
