import { defineStore } from 'pinia'

export const useTransferDetailsStore = defineStore('transferDetails', {
	state: () => ({
		show: false,
		conditions: [
			{
				key: 'Сумма списания',
				value: '10 000 ₸'
			},
			{
				key: 'Комиссия',
				value: '0 ₸ '
			},
			{
				key: 'Статус',
				value: 'Исполнен',
                status: true
			},
			{
				key: 'Номер квитанции',
				value: '56789900'
			},
			{
				key: 'Счет списания',
				value: 'KZ****4893'
			},
			{
				key: 'Счет получателя',
				value: 'KZ****4893'
			},
			{
				key: 'Получатель',
				value: 'Ахметжанулы Сейтжан А.'
			},
			{
				key: 'Дата',
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
