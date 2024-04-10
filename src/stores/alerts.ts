import { AlertStoreState, AlertType } from '@/types'
import { defineStore } from 'pinia'

export const useAlertsStore = defineStore('alerts', {
	state: (): AlertStoreState => ({
		errorAlert: {} as AlertType
	}),
	actions: {
		showErrorAlert(payload: AlertType) {
			this.errorAlert = payload
		},
		resetAlertData() {
			this.errorAlert = {} as AlertType
		}
	}
})
