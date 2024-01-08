import { defineStore } from 'pinia'

import { FORM_STATE, FormStore } from '@/types/form'

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
		clearErrors(fieldName?: any) {
			if (fieldName) {
				this.errors[fieldName] = ''
			} else {
				this.errors = {
					amount: ''
				}
			}
		},
		setState(state: FORM_STATE) {
			this.state = state
		}
	}
})
