import { defineStore } from 'pinia'

import { FORM_STATE, FormStore } from '@/types/form'
import { extractValidationErrors } from '@/utils/validators'

export interface OwnStore extends FormStore {}

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
					from: '',
					to: '',
					amount: '',
					writeOffAmount: ''
				}
			}
		}
	}
})
