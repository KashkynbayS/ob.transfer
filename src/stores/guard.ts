import { defineStore } from 'pinia';

export const useLeaveConfirmedStore = defineStore('leaveConfirmed', {
    state: () => ({
        isLeaveConfirmed: false
    }),

    actions: {
        setIsLeaveConfirmed(value: boolean) {
            this.isLeaveConfirmed = value;
        }
    }
});
