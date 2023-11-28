import { defineStore } from 'pinia'
import { object } from 'yup'
import { ExternalForm } from './../types/external'

import { ExternalService } from '@/services/external.service'
import { FORM_STATE, FormStore } from '@/types/form'
import { extractValidationErrors, validateAmountFromAccount } from '@/utils/validators'

export interface ExternalStore extends FormStore {}

// TODO: Добавить остальную валидацию после внедрения ТЗ и реализации API
const formSchema = object({
	amount: validateAmountFromAccount('amount', 'EXTERNAL.FORM.ERRORS.NOT_ENOUGH_MONEY')
})

export const useExternalStore = defineStore('external', {
	state: (): ExternalStore => ({
		state: FORM_STATE.INITIAL,
		errors: {
			amount: ''
		}
	}),
	actions: {
		validateAndSubmit(form: ExternalForm) {
			this.validate(form).then(() => {
				this.submit(form)
			})
		},
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
		submit(form: ExternalForm) {
			ExternalService.transfer(form)
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
