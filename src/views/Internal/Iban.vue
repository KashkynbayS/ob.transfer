<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { Button, CurrencyInput, IbanInput, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'

import AccountDropdown from '@/components/AccountDropdown.vue'

// import { addToFrequents } from '@/services/frequentService'

import { ACCOUNTS_GROUPS } from '@/mocks/internal'

import { CURRENCY_SYMBOL } from '@/constants'

import { useIbanStore } from '@/stores/iban.ts'
import { useSuccessStore } from '@/stores/success'

import { CURRENCY } from '@/types'
import { FORM_STATE } from '@/types/form'
import { IbanForm } from '@/types/iban'

const IbanStore = useIbanStore()
const successStore = useSuccessStore()

// Modal
const modal = ref<InstanceType<typeof Modal> | null>(null)
const router = useRouter()
let destPath = ''
let isLeaveConfirmed = false

const actions = reactive<ModalAction[]>([
	{
		mode: 'primary',
		title: 'Перейти',
		autoClose: true,
		action: () => {
			isLeaveConfirmed = true
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
onBeforeRouteLeave((to1, _, next) => {
	const { from, to, receiverName, amount } = form.value
	const isFormDirty = from || to || receiverName || amount
	destPath = to1.fullPath

	if (!isFormDirty || isLeaveConfirmed) {
		next(true)
	}

	modal.value?.open()
})

const form = ref<IbanForm>({
	from: undefined,
	to: '',
	receiverName: '',
	amount: '',
	transferType: 'iban'
})

onMounted(() => {
	const queryParams = router.currentRoute.value.query

	form.value.to = (queryParams.to as string) || ''
	form.value.receiverName = (queryParams.receiverName as string) || ''
	form.value.amount = (queryParams.amount as string) || ''
})

watch(
	() => IbanStore.state,
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

// Submit handler
const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()
	IbanStore.validateAndSubmit(form.value)

	// try {
	// 	await addToFrequents(form)
	// } catch (error) {
	// 	console.error('Ошибка при добавлении в избранное:', error)
	// }
}
</script>

<template>
	<form class="internal-iban-form" @submit="handleSubmit">
		<div class="internal-iban-form-top">
			<AccountDropdown
				v-model="form.from"
				class="form-field"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.TO')"
			/>
			<IbanInput
				id="recieverNameModel"
				v-model:model-value="form.to"
				:invalid="!!form.to"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
			/>
			<Input
				id="123"
				v-model:model-value="form.receiverName"
				:invalid="!!form.receiverName"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.RECIEVER_NAME')"
			/>
			<CurrencyInput
				id="amount"
				v-model:model-value="form.amount"
				:invalid="!!IbanStore.errors.amount"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.SUM')"
				:helper-text="IbanStore.errors.amount ? $t(IbanStore.errors.amount) : ''"
				@update:model-value="IbanStore.clearErrors()"
			/>
		</div>
		<div class="internal-iban-form-bottom">
			<Button id="internal-iban-submit" type="primary" @click="handleSubmit">
				{{ $t('INTERNAL.IBAN.FORM.SUBMIT') }}
			</Button>
		</div>
	</form>

	<Modal ref="modal" :actions="actions" close-on-outline-click>
		<template #title>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.TITLE') }}</template>
		<template #body>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.SUBTITLE') }}</template>
	</Modal>
</template>

<style scoped lang="scss">
.internal-iban-form {
	box-sizing: content-box;
	padding: var(--space-4) var(--space-4) 0 var(--space-4);

	.form-field {
		padding-bottom: var(--space-3);
	}

	.internal-iban-form-bottom {
		position: absolute;
		bottom: var(--space-5);
		width: calc(100% - var(--space-4));

		Button {
			width: calc(100% - var(--space-4));
		}
	}
}
</style>
