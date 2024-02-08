import { defineStore } from 'pinia'

export const useApplicationIDStore = defineStore('applicationID', {
    state: () => ({
        applicationID: null as string | null
    }),
    actions: {
        setApplicationID(applicationID: string) {
        this.applicationID = applicationID
        }
    }
})