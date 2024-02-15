import { defineStore } from 'pinia'

import { FORM_STATE, FormStore } from '@/types/form'
import { extractValidationErrors } from '@/utils/validators'

export interface PhoneStore extends FormStore {}

export const usePhoneStore = defineStore('phone', {
	state: (): PhoneStore => ({
		state: FORM_STATE.INITIAL,
		applicationId: '',
		errors: {
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
					amount: ''
				}
			}
		},
	}
})
