import { defineStore } from 'pinia'
import { object, string, ValidationError } from 'yup'

import { OwnService } from '@/services/own.service'

import { Account } from '@/types/account'
import { OwnForm } from '@/types/own'

export enum OWN_FORM_STATE {
	INITIAL = 'initial',
	LOADING = 'loading',
	SUCCESS = 'success',
	ERROR = 'error'
}

export interface OwnStore {
	errors: Record<string, string>
	state: OWN_FORM_STATE
}

const validateAmount = (value: string | undefined, fromAccount: Account) => {
	if (!fromAccount || !value) {
		return true
	}

	return fromAccount.amount >= Number(value)
}

const formSchema = object({
	amount: string().test('amount', 'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY', function (value) {
		const { fromAccount } = this.options.context as { fromAccount: Account }
		return validateAmount(value, fromAccount)
	}),
	writeOffAmount: string().test('writeOffAmount', 'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY', function (value) {
		const { fromAccount } = this.options.context as { fromAccount: Account }
		return validateAmount(value, fromAccount)
	})
})

export const useOwnStore = defineStore('own', {
	state: (): OwnStore => ({
		state: OWN_FORM_STATE.INITIAL,
		errors: {
			amount: '',
			writeOffAmount: ''
		}
	}),
	actions: {
		submitForm(form: OwnForm) {
			OwnService.transferOwn(form)
				.then(() => {
					this.state = OWN_FORM_STATE.SUCCESS
				})
				.catch(() => {
					this.state = OWN_FORM_STATE.ERROR
				})
		},
		validate(form: OwnForm) {
			this.clearErrors()
			this.state = OWN_FORM_STATE.LOADING

			formSchema
				.validate(form, { abortEarly: false, context: { fromAccount: form.from } })
				.then(() => {
					this.submitForm(form)
				})
				.catch((err) => {
					this.state = OWN_FORM_STATE.INITIAL
					const validationErrors = err as ValidationError

					this.errors = validationErrors.inner.reduce(
						(acc, e) => {
							acc[e.path as keyof typeof acc] = e.message
							return acc
						},
						{ ...this.errors }
					)
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
