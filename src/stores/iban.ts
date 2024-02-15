import { defineStore } from 'pinia'

import { FORM_STATE, FormStore } from '@/types/form'
import { extractValidationErrors } from '@/utils/validators'

export interface IbanStore extends FormStore {}

export const useIbanStore = defineStore('iban', {
	state: (): IbanStore => ({
		state: FORM_STATE.INITIAL,
		applicationId: '',
		errors: {
			to: '',
			receiverName: '',
			knp: '',
			paymentPurposes: '',
			amount: ''
		}
	}),
	actions: {
		setState(state: FORM_STATE) {
			this.state = state
		},
		setValidationError(err: unknown) {
			this.errors = extractValidationErrors(this.errors, err)
		},
		clearErrors(fieldName?: any) {
			if (fieldName) {
				this.errors[fieldName] = ''
			} else {
				this.errors = {
					to: '',
					receiverName: '',
					knp: '',
					paymentPurposes: '',
					amount: ''
				}
			}
		}
	}
})
