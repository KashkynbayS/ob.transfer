import { defineStore } from 'pinia'
import { object } from 'yup'

import { OwnService } from '@/services/own.service'

import { FORM_STATE, FormStore } from '@/types/form'
import { OwnForm } from '@/types/own'
import { extractValidationErrors, validateAmount } from '@/utils/validators'

export interface OwnStore extends FormStore {}

const formSchema = object({
	amount: validateAmount(
		'amount',
		'INTERNAL.IBAN.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'INTERNAL.IBAN.FORM.ERRORS.EMPTY_AMOUNT',
		'INTERNAL.IBAN.FORM.ERRORS.MIN_AMOUNT'
	),
})

export const useOwnStore = defineStore('own', {
	state: (): OwnStore => ({
		state: FORM_STATE.INITIAL,
		errors: {
			amount: '',
			writeOffAmount: ''
		}
	}),
	actions: {
		submitForm(form: OwnForm) {
			OwnService.transferOwn(form)
				.then(() => {
					this.state = FORM_STATE.SUCCESS
				})
				.catch(() => {
					this.state = FORM_STATE.ERROR
				})
		},
		validate(form: OwnForm) {
			this.clearErrors()
			this.state = FORM_STATE.LOADING

			formSchema
				.validate(form, { abortEarly: false, context: { fromAccount: form.from } })
				.then(() => {
					this.submitForm(form)
				})
				.catch((err) => {
					this.state = FORM_STATE.INITIAL
					this.errors = extractValidationErrors(this.errors, err)
				})
		},
		clearErrors() {
			this.errors = {
				amount: '',
				writeOffAmount: ''
			}
		}
	}
})
