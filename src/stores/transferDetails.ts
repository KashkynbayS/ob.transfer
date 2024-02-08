import { defineStore } from 'pinia'

export const useTransferDetailsStore = defineStore('transferDetails', {
	state: () => ({
		show: false,
		conditions: [
			{
				key: 'TRANSFER_DETAILS.FORM.WRITE_OFF_AMOUNT',
				value: '10 000 ₸'
			},
			{
				key: 'TRANSFER_DETAILS.FORM.COMMISSION',
				value: '0 ₸ '
			},
			{
				key: 'TRANSFER_DETAILS.FORM.STATUS.TITLE',
				value: 'TRANSFER_DETAILS.FORM.STATUS.VALUE',
				status: true
			},
			{
				key: 'TRANSFER_DETAILS.FORM.RECEIPT_NUMBER',
				value: '56789900'
			},
			{
				key: 'TRANSFER_DETAILS.FORM.WRITE_OFF_ACCOUNT',
				value: 'KZ****4893'
			},
			{
				key: 'TRANSFER_DETAILS.FORM.RECEIVER_ACCOUNT',
				value: 'KZ****4893'
			},
			{
				key: 'TRANSFER_DETAILS.FORM.RECEIVER',
				value: 'Ахметжанулы Сейтжан А.'
			},
			{
				key: 'TRANSFER_DETAILS.FORM.DATE',
				value: '11.04.2023'
			}
		]
	}),
	actions: {
		openBottomSheet() {
			this.show = true
		},
		closeBottomSheet() {
			this.show = false
		}
	}
})
