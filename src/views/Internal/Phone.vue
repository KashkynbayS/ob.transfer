<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import User from '@ui-kit/kmf-icons/interface/users/user.svg'
import { BottomSheet, Button, Cell, CellGroup, CurrencyInput, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'

import AccountDropdown from '@/components/AccountDropdown.vue'

import { ACCOUNTS_GROUPS } from '@/mocks/internal'

import { CURRENCY_SYMBOL } from '@/constants'

import { usePhoneStore } from '@/stores/phone.ts'
import { useSuccessStore } from '@/stores/success'

import { CURRENCY } from '@/types'
import { FORM_STATE } from '@/types/form'
import { PhoneForm } from '@/types/phone'

const phoneStore = usePhoneStore()
const successStore = useSuccessStore()

const form = ref<PhoneForm>({
	from: undefined,
	phoneNumber: '',
	receiverName: '',
	amount: '',
	transferType: 'phone'
})

const errors = reactive({
	from: '',
	phoneNumber: '',
	amount: ''
})

const isPhoneInvalid = ref(false)

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
	const { from, phoneNumber, amount } = form.value
	const isFormDirty = from || phoneNumber || amount
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
	form.value.phoneNumber = contact.phoneNumber
	form.value.receiverName = contact.name
	contactBottomSheetRef?.value?.close()
}

watch(
	() => phoneStore.state,
	(state) => {
		const currency = form.value.from ? form.value.from?.currency : CURRENCY.KZT

		switch (state) {
			case FORM_STATE.SUCCESS:
				successStore.setDetails(Number(form.value.amount), currency, [
					{ name: 'Сумма списания', value: `${form.value.amount} ${CURRENCY_SYMBOL[currency]}` },
					{ name: 'Статус', value: 'Исполнено', colored: true },
					{ name: 'Номер квитанции', value: '56789900' },
					{ name: 'Счет списания', value: 'KZ****4893' },
					{ name: 'Счет зачисления', value: 'KZ****4893' },
					{ name: 'Дата', value: '11.04.2023' }
				])
				router.push('/Success')
				break

			case FORM_STATE.ERROR:
				router.push('Error')
				break

			case FORM_STATE.INITIAL:
			default:
				break
		}

		if (state) {
			console.log(state)
		}
	}
)

const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()
	phoneStore.validateAndSubmit(form.value)
}

// _________________________________________
</script>

<template>
	<form class="internal-phone-form">
		<div class="internal-phone-form-top">
			<AccountDropdown
				id="from"
				v-model="form.from"
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
				:invalid="!!phoneStore.errors.amount"
				:helper-text="phoneStore.errors.amount ? $t(phoneStore.errors.amount) : ''"
				@on-input="phoneStore.clearErrors()"
				@update:model-value="phoneStore.clearErrors()"
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
