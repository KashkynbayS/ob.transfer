<script setup lang="ts">
import { reactive, ref } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { Button, CurrencyInput, IbanInput, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'

import AccountDropdown from '@/components/AccountDropdown.vue'
import KnpDropdown from '@/components/KnpDropdown.vue'

// import { addToFrequents } from '@/services/frequentService'

import { ACCOUNTS_GROUPS } from '@/mocks/internal'

import { useIbanStore } from '@/stores/iban.ts'

import { handleTransferSSEResponse } from '@/services/sse.service'
import { TransferService } from '@/services/transfer.service'
import { FORM_STATE } from '@/types/form'
import { IbanForm } from '@/types/iban'
import { Knp } from '@/types/knp'
import { TypeOfTransfer } from '@/types/transfer'

import { validateInternalIban } from '@/helpers/internal-form-helper'

const IbanStore = useIbanStore()

IbanStore.clearErrors()

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
	knp: null,
	paymentPurposes: '',
	amount: null,
	transferType: 'iban'
})

// Submit handler
const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()

	try {
		await validateInternalIban(form.value)
		IbanStore.clearErrors()
		IbanStore.setState(FORM_STATE.LOADING)
		isLeaveConfirmed = true

		TransferService.initWithSSE(
			{
				iban: form.value.from!.iban,
				recIban: form.value.to,
				recFio: form.value.receiverName,
				amount: String(form.value.amount),
				typeOfTransfer: TypeOfTransfer.InternalByAccount,
				paymentPurposes: form.value.paymentPurposes !== null ? form.value.paymentPurposes : undefined,
				knp: form.value.knp !== null ? String(form.value.knp) : undefined
			},
			(event) => {
				IbanStore.setState(FORM_STATE.SUCCESS)
				handleTransferSSEResponse(form.value, event, router)
			}
		)
			.then((e) => {
				IbanStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
			})
			.catch(() => {
				IbanStore.setState(FORM_STATE.ERROR)
			})

	} catch (err) {
		IbanStore.setState(FORM_STATE.INITIAL)
		IbanStore.setValidationError(err)
	}
}

const handleKnpUpdate = () => {
	IbanStore.clearErrors('knp')
}
</script>

<template>
	<div>
		<form class="internal-iban-form" @submit="handleSubmit">
			<div class="internal-iban-form-top">
				<AccountDropdown
					v-model="form.from"
					:accounts-groups="ACCOUNTS_GROUPS"
					:label="$t('OWN.FORM.FROM')"
				/>
				<IbanInput
					id="recieverNameModel"
					v-model:model-value="form.to"
					:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
					:invalid="!!IbanStore.errors.to"
					:helper-text="IbanStore.errors.to ? $t(IbanStore.errors.to) : ''"
					@update:model-value="IbanStore.clearErrors('to')"
				/>
				<Input
					id="123"
					v-model:model-value="form.receiverName"
					:label="$t('INTERNAL.IBAN.FORM.RECIEVER_NAME')"
					:invalid="!!IbanStore.errors.receiverName"
					:helper-text="IbanStore.errors.receiverName ? $t(IbanStore.errors.receiverName) : ''"
					@update:model-value="IbanStore.clearErrors('receiverName')"
				/>
				<KnpDropdown
					v-if="form.to == 'KZ1111' && form.to !== null"
					id="knp"
					v-model="form.knp as Knp | null"
					:error-invalid="!!IbanStore.errors.knp"
					:helper-text="!!IbanStore.errors.knp ? $t(IbanStore.errors.knp) : ''"
					:update-field="handleKnpUpdate"
				/>
				<Input
					v-if="form.to == 'KZ1111' && form.to !== null"
					id="paymentPurposes"
					v-model="form.paymentPurposes"
					:label="$t('EXTERNAL.FORM.PAYMENT_PURPOSES')"
					:invalid="!!IbanStore.errors.paymentPurposes"
					:helper-text="!!IbanStore.errors.paymentPurposes ? $t(IbanStore.errors.paymentPurposes) : ''"
					@update:model-value="IbanStore.clearErrors('paymentPurposes')"
				/>
				<CurrencyInput
					id="amount"
					v-model:model-value="form.amount"
					:label="$t('INTERNAL.IBAN.FORM.SUM')"
					:invalid="!!IbanStore.errors.amount"
					:helper-text="IbanStore.errors.amount ? $t(IbanStore.errors.amount) : ''"
					@update:model-value="IbanStore.clearErrors('amount')"
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
	</div>
</template>

<style scoped lang="scss">
.internal-iban-form {
	box-sizing: content-box;
	padding: var(--space-3) var(--space-4) 0 var(--space-4);

	&-top {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
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
