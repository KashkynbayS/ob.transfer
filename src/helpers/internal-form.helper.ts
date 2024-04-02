import { PhoneForm } from '@/types/phone'
import { validateAccount, validateAmount, validatePhone } from '@/utils'
import { object } from 'yup'

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

export const validateInternalPhone = (form: PhoneForm) => {
	return formSchema.validate(form, { abortEarly: false, context: { fromAccount: form.from } })
}