export const INTERNAL = {
	TITLE: 'Внутри KMF',
	TABS: {
		PHONE: 'По номеру',
		IBAN: 'По счету'
	},
	PHONE: {
		FORM: {
			ACCOUNT_FROM: 'Счёт KZT',
			PHONE_NUMBER: 'Номер телефона',
			SUM: 'Сумма',
			SUBMIT: 'Отправить',
			ERRORS: {
				ENTER_PHONE_NUMBER: 'Введите номер телефона',
				ACCOUNT_NOT_FOUND: 'По номеру телефона не найден клиент',
				OWNER_ACCOUNT: 'Вы ввели номер владельца счета',
				NOT_ENOUGH_MONEY: 'Недостаточно средств',
				EMPTY_AMOUNT: 'Введите сумму',
				MIN_AMOUNT: 'Минимальная сумма перевода 100 ₸',
				MAX_AMOUNT: 'Максимальная сумма перевода в день 1 млн ₸'
			}
		}
	},
	IBAN: {
		FORM: {
			ACCOUNT_FROM: 'Счёт KZT',
			ACCOUNT_TO: 'Счет зачисления',
			RECIEVER_NAME: 'Имя получателя',
			COMPANY_NAME: 'Наименование',
			PAYMENT_PURPOSES: 'Назначения платежа',
			SUM: 'Сумма',
			SUBMIT: 'Отправить',
			ERRORS: {
				EMPTY_TO: 'Введите счет зачисления',
				ACCOUNT_NOT_FOUND: 'По номеру счета не найден клиент',
				EMPTY_RECEIVER_NAME: 'Введите имя получателя',
				EMPTY_COMPANY_NAME: 'Введите наименование',
				EMPTY_PAYMENT_PURPOSES: 'Введите назначение платежа',
				NOT_ENOUGH_MONEY: 'Недостаточно средств',
				EMPTY_AMOUNT: 'Введите сумму',
				MIN_AMOUNT: 'Минимальная сумма перевода 100 ₸',
				MAX_AMOUNT: 'Максимальная сумма перевода в день 1 млн ₸'

			}
		}
	},
	MODAL: {
		LEAVE_WHEN_FORM_IS_DIRTY: {
			TITLE: 'Информация не будет сохранена',
			SUBTITLE: 'Вы уверены, что хотите перейти \n на другую страницу?',
			GO: 'Перейти',
			STAY: 'Остаться'
		}
	}
}
