import { defineStore } from 'pinia'
import { object } from 'yup'
import { ExternalForm } from './../types/external'

import { FORM_STATE, FormStore } from '@/types/form'
import {
	extractValidationErrors,
	validateAccount,
	validateAmount,
	validateIban,
	validateIin,
	validateKbe,
	validateKnp,
	validateReceiverName
} from '@/utils/validators'

export interface ExternalStore extends FormStore { }

// TODO: Добавить остальную валидацию после внедрения ТЗ и реализации API
const formSchema = object({
	from: validateAccount('from', 'OWN.FORM.ERRORS.SELECT_ACCOUNT'),
	iban: validateIban('iban', 'EXTERNAL.FORM.ERRORS.EMPTY_IBAN'),
	kbe: validateKbe('kbe', 'KBE.TITLE'),
	knp: validateKnp('knp', 'KNP.TITLE'),
	iin: validateIin('iin', 'EXTERNAL.FORM.ERRORS.EMPTY_IIN'),
	receiverName: validateReceiverName('receiverName', 'EXTERNAL.FORM.ERRORS.EMPTY_RECEIVER_NAME'),
	amount: validateAmount(
		'amount',
		'EXTERNAL.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'EXTERNAL.FORM.ERRORS.EMPTY_AMOUNT',
		'EXTERNAL.FORM.ERRORS.MIN_AMOUNT'
	)
})

export const useExternalStore = defineStore('external', {
	state: (): ExternalStore => ({
		applicationId: '',
		state: FORM_STATE.INITIAL,
		errors: {
			from: '',
			iban: '',
			kbe: '',
			knp: '',
			iin: '',
			receiverName: '',
			paymentPurposes: '',
			amount: '',
		}
	}),
	actions: {
		validate(form: ExternalForm) {
			this.clearErrors()
			this.state = FORM_STATE.LOADING

			return formSchema
				.validate(form, { abortEarly: false, context: { fromAccount: form.from } })
				.then(() => {
					this.state = FORM_STATE.SUCCESS
					return form
				})
				.catch((err) => {
					this.state = FORM_STATE.INITIAL
					this.errors = extractValidationErrors(this.errors, err)
					throw err
				})
		},
		setState(state: FORM_STATE) {
			this.state = state
		},
		clearErrors(fieldName?: any) {
			if (fieldName) {
				this.errors[fieldName] = ''
			} else {
				this.errors = {
					from: '',
					iban: '',
					kbe: '',
					knp: '',
					iin: '',
					receiverName: '',
					paymentPurposes: '',
					amount: ''
				}
			}
		}
	}
})
