import { defineStore } from 'pinia'
import { object } from 'yup'
import { PhoneForm } from './../types/phone'

import { PhoneService } from '@/services/phone.service'
import { FORM_STATE, FormStore } from '@/types/form'
import { extractValidationErrors, validateAmount } from '@/utils/validators'

export interface PhoneStore extends FormStore {}

// TODO: Добавить остальную валидацию после внедрения ТЗ и реализации API
const formSchema = object({
	amount: validateAmount(
		'amount',
		'INTERNAL.PHONE.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'INTERNAL.PHONE.FORM.ERRORS.EMPTY_AMOUNT',
		'INTERNAL.PHONE.FORM.ERRORS.MIN_AMOUNT'
	  )
})

export const usePhoneStore = defineStore('phone', {
	state: (): PhoneStore => ({
		state: FORM_STATE.INITIAL,
		errors: {
			amount: ''
		}
	}),
	actions: {
		validateAndSubmit(form: PhoneForm) {
			this.validate(form).then(() => {
				this.submit(form)
			})
		},
		validate(form: PhoneForm) {
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
		submit(form: PhoneForm) {
			PhoneService.transfer(form)
				.then(() => {
					this.state = FORM_STATE.SUCCESS
				})
				.catch(() => {
					this.state = FORM_STATE.ERROR
				})
		},
		clearErrors() {
			this.errors = {
				amount: ''
			}
		}
	}
})
