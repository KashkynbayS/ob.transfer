import { defineStore } from 'pinia'
import { object } from 'yup'

import { TransferService } from '@/services/transfer.service'
import { FORM_STATE, FormStore } from '@/types/form'
import { OwnForm } from '@/types/own'
import { TypeOfTransfer } from '@/types/transfer'
import { extractValidationErrors, validateAccount, validateAmount, validateWriteOffAmount } from '@/utils/validators'

export interface OwnStore extends FormStore {}

const formSchema = object({
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

export const useOwnStore = defineStore('own', {
	state: (): OwnStore => ({
		state: FORM_STATE.INITIAL,
		applicationId: '',
		errors: {
			from: '',
			to: '',
			amount: '',
			writeOffAmount: ''
		}
	}),
	actions: {
		submitForm(form: OwnForm) {
			TransferService.init({
				iban: form.from!.iban,
				recIban: form.to!.iban,
				amount: String(form.amount),
				typeOfTransfer: TypeOfTransfer.BetweenMyAccounts
			})
				.then((e) => {
					this.applicationId = e.applicationID
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
				.validate(form, { abortEarly: false, context: { fromAccount: form.from, toAccount: form.to } })
				.then(() => {
					this.submitForm(form)
				})
				.catch((err) => {
					this.state = FORM_STATE.INITIAL
					this.errors = extractValidationErrors(this.errors, err)
				})
		},
		clearErrors(fieldName?: any) {
			if (fieldName) {
				this.errors[fieldName] = ''
			} else {
				this.errors = {
					from: '',
					to: '',
					amount: '',
					writeOffAmount: ''
				}
			}
		}
	}
})
