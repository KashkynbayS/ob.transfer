import { defineStore } from 'pinia'
import { object } from 'yup'
import { IbanForm } from './../types/iban'

import { IbanService } from '@/services/iban.service'
import { FORM_STATE, FormStore } from '@/types/form'
import { extractValidationErrors, validateAmountFromAccount } from '@/utils/validators'

export interface IbanStore extends FormStore {}

// TODO: Добавить остальную валидацию после внедрения ТЗ и реализации API
const formSchema = object({
	amount: validateAmountFromAccount('amount', 'INTERNAL.IBAN.FORM.ERRORS.NOT_ENOUGH_MONEY')
})

export const useIbanStore = defineStore('iban', {
	state: (): IbanStore => ({
		state: FORM_STATE.INITIAL,
		errors: {
			amount: ''
		}
	}),
	actions: {
		validateAndSubmit(form: IbanForm) {
			this.validate(form).then(() => {
				this.submit(form)
			})
		},
		validate(form: IbanForm) {
			this.clearErrors()
			this.state = FORM_STATE.LOADING

			console.log("loading");
			

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
		submit(form: IbanForm) {
			IbanService.transfer(form)
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
