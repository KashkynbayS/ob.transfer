<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { Button, CurrencyInput, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { SelectContactInput } from '@ui-kit/ui-kit/dist/widgets'

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

phoneStore.clearErrors()

const form = ref<PhoneForm>({
	from: undefined,
	phoneNumber: '',
	receiverName: '',
	amount: null,
	transferType: 'phone'
})

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

			<SelectContactInput/>

			<CurrencyInput
				id="123"
				v-model="form.amount"
				class="form-field"
				:label="$t('INTERNAL.PHONE.FORM.SUM')"
				:invalid="!!phoneStore.errors.amount"
				:helper-text="phoneStore.errors.amount ? $t(phoneStore.errors.amount) : ''"
				@update:model-value="phoneStore.clearErrors('amount')"
			/>
		</div>
		<div class="internal-phone-form-bottom">
			<Button id="123" type="primary" @click="handleSubmit"> {{ $t('INTERNAL.PHONE.FORM.SUBMIT') }} </Button>
		</div>
	</form>

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
