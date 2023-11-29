<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import User from '@ui-kit/kmf-icons/interface/users/user.svg'
import { BottomSheet, Button, Cell, CellGroup, CurrencyInput, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'

import * as Yup from 'yup'

import AccountDropdown from '@/components/AccountDropdown.vue'

import { addToFrequents } from '@/services/frequentService'

import { ACCOUNTS_GROUPS } from '@/mocks/internal'

import { Account } from '@/types'

const form = reactive({
	accountFrom: null as Account | null,
	// accountFrom: {
	// 	id: "KZT-deposit",
	// 	currency: "kzt",
	// 	title: "Депозит KZT",
	// 	iban: "KZ123456789012345681",
	// 	amount: 500
	// },
	phoneNumber: '',
	receiverName: '',
	amount: '',
	transferType: 'phone'
})

const errors = reactive({
	accountFrom: '',
	phoneNumber: '',
	amount: ''
})

const transferredAmount = 567890 // сумма который был переведен в день
const ResidualAmount = 1000000 - transferredAmount // остаток суммы перевода в день

// Validation
const schemaPhone = Yup.object().shape({
	phoneNumber: Yup.string()
		.test('ownerPhone', 'Вы ввели номер владельца счета', function (value) {
			return value !== contact.ownerPhone
		})
		.test('phoneExists', 'По номеру телефона не найден клиент', function (value) {
			const phoneNumberExists = contact.list.some((item) => item.phoneNumber === value)
			return phoneNumberExists
		})
})

const schemaAmount = Yup.object().shape({
	amount: Yup.number()
		.min(100, 'Минимальная сумма перевода 100 ₸')
		.test('balance', 'Недостаточно средств', function (value) {
			const selectedAccount = form.accountFrom?.id
			const selectedAccountData = ACCOUNTS_GROUPS.flatMap((group) => group.list).find(
				(account) => account.id === selectedAccount
			)
			if (!selectedAccountData) {
				return true
			}
			return value ? value <= selectedAccountData?.amount : false
		})
		.test('ResidualAmount', `Остаток суммы перевода в день ${ResidualAmount} ₸`, function (value) {
			return !value ? false : value <= ResidualAmount
		})
})

const isPhoneInvalid = ref(false)
const isAmountInvalid = ref(false)

async function validatePhone() {
	if (form.phoneNumber.trim() === '') {
		isPhoneInvalid.value = true
		errors.phoneNumber = 'Введите номер телефона'
		setTimeout(() => {
			isPhoneInvalid.value = false
			errors.phoneNumber = ''
		}, 2000)
	} else {
		try {
			await schemaPhone.validate(form, { abortEarly: false })
			isPhoneInvalid.value = false
			errors.phoneNumber = ''
		} catch (validationErrors: any) {
			isPhoneInvalid.value = true
			errors.phoneNumber = validationErrors.errors[0]
		}
	}
}

async function validateAmount() {
	if (form.amount === '') {
		isAmountInvalid.value = true
		errors.amount = 'Введите сумму'
		setTimeout(() => {
			isAmountInvalid.value = false
			errors.amount = ''
		}, 2000)
	} else {
		try {
			await schemaAmount.validate(form, { abortEarly: false })
			isAmountInvalid.value = false
			errors.amount = ''
		} catch (validationErrors: any) {
			isAmountInvalid.value = true
			errors.amount = validationErrors.errors[0]
		}
	}
}

const handleSubmit = async () => {
	try {
		await validatePhone()
		await validateAmount()

		if (!isPhoneInvalid.value && !isAmountInvalid.value) {
			await addToFrequents(form)
		}
	} catch (error) {
		console.error('Ошибка при добавлении в избранное:', error)
	}
}

// Modal
const modal = ref<InstanceType<typeof Modal> | null>(null)
const router = useRouter()
let destPath = ''
let isLeaveConfiirmed = false
const actions = reactive<ModalAction[]>([
	{
		mode: 'primary',
		title: 'Перейти',
		autoClose: true,
		action: () => {
			isLeaveConfiirmed = true
			router.push(destPath)
		}
	},
	{
		mode: 'ghost',
		title: 'Остаться',
		autoClose: true
	}
])

// Guard
onBeforeRouteLeave((to, _, next) => {
	const { accountFrom, phoneNumber, amount } = form
	const isFormDirty = accountFrom || phoneNumber || amount
	destPath = to.fullPath

	if (!isFormDirty || isLeaveConfiirmed) {
		next(true)
	}

	modal.value?.open()
})

const contact = reactive({
	value: '',
	search: '',
	ownerPhone: '87053811230',
	list: [
		{ name: 'Yernar', phoneNumber: '87053811231' },
		{ name: 'Dulat', phoneNumber: '87053811232' },
		{ name: 'Aibek', phoneNumber: '87053811233' },
		{ name: 'Dosbol', phoneNumber: '87053811234' },
		{ name: 'Zeinep', phoneNumber: '87053811235' }
	]
})

const filteredContactList = computed(() =>
	contact.list.filter((item) => item.name?.toLowerCase().includes(contact.search.toLowerCase()))
)

const contactBottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)

function selectContact(contact: any) {
	form.phoneNumber = contact.phoneNumber
	form.receiverName = contact.name
	contactBottomSheetRef?.value?.close()
}

onMounted(() => {
	const queryParams = router.currentRoute.value.query

	// form.accountFrom = queryParams.from as Account | null;
	// form.accountFrom = JSON.parse(queryParams.from) as Account | null;

	if (typeof queryParams.from === 'string') {
		try {
			form.accountFrom = JSON.parse(queryParams.from) as Account | null
		} catch (error) {
			console.error('Ошибка при парсинге queryParams.from:', error)
			form.accountFrom = null
		}
	} else {
		form.accountFrom = null
	}

	console.log('Получаем: ' + form.accountFrom)

	form.phoneNumber = (queryParams.to as string) || ''
	form.receiverName = (queryParams.receiverName as string) || ''
	form.amount = (queryParams.amount as string) || ''
})

// _________________________________________
</script>

<template>
	<form class="internal-phone-form">
		<div class="internal-phone-form-top">
			<AccountDropdown
				id="from"
				v-model="form.accountFrom"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.FROM')"
			/>
			<Input
				id="123"
				v-model="form.phoneNumber"
				class="form-field"
				:label="$t('INTERNAL.PHONE.FORM.PHONE_NUMBER')"
				:invalid="isPhoneInvalid"
				:helper-text="errors.phoneNumber"
			>
				<template #append>
					<div v-if="form.receiverName" class="receiver-name" @click="contactBottomSheetRef?.open()">
						{{ form.receiverName }}
					</div>
					<div v-else>
						<User @click="contactBottomSheetRef?.open()" />
					</div>
				</template>
			</Input>

			<CurrencyInput
				id="123"
				v-model="form.amount"
				class="form-field"
				:label="$t('INTERNAL.PHONE.FORM.SUM')"
				:invalid="isAmountInvalid"
				:helper-text="errors.amount"
			/>
		</div>
		<div class="internal-phone-form-bottom">
			<Button id="123" type="primary" @click="handleSubmit"> {{ $t('INTERNAL.PHONE.FORM.SUBMIT') }} </Button>
		</div>
	</form>

	<BottomSheet ref="contactBottomSheetRef">
		<template #title><h4>Контакты</h4></template>
		<template #content>
			<div class="address__bottom-sheet-content">
				<Input id="contact-search" v-model="contact.search" placeholder="Поиск по названию" type="search" />
				<CellGroup>
					<Cell v-for="item in filteredContactList" :key="item.phoneNumber" @click="selectContact(item)">
						<template #title>{{ item.name }}</template>
						<template #subtitle>{{ item.phoneNumber }}</template>
					</Cell>
				</CellGroup>
			</div>
		</template>
	</BottomSheet>

	<Modal ref="modal" v-bind="{ asd: 'asdasd' }" :actions="actions" close-on-outline-click>
		<template #title>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.TITLE') }}</template>
		<template #body>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.SUBTITLE') }}</template>
	</Modal>
</template>

<style scoped lang="scss">
.internal-phone-form {
	box-sizing: content-box;
	padding: var(--space-4) var(--space-4) 0 var(--space-4);

	&-top {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.internal-phone-form-bottom {
		position: absolute;
		bottom: var(--space-5);
		width: calc(100% - var(--space-4));

		Button {
			width: calc(100% - var(--space-4));
		}
	}
}
</style>