<script setup lang="ts">
import { reactive, ref } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { Button, CurrencyInput, IbanInput, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'

import AccountDropdown from '@/components/AccountDropdown.vue'

// import { addToFrequents } from '@/services/frequentService'

import { ACCOUNTS_GROUPS } from '@/mocks/internal'

import { useIbanStore } from '@/stores/iban.ts'

import { handleTransferSSEResponse } from '@/services/sse.service'
import { TransferService } from '@/services/transfer.service'
import { FORM_STATE } from '@/types/form'
import { IbanForm } from '@/types/iban'
import { TypeOfTransfer } from '@/types/transfer'

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
	amount: null,
	transferType: 'iban'
})

// Submit handler
const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()
	IbanStore.clearErrors()
	IbanStore.setState(FORM_STATE.LOADING)
	isLeaveConfirmed = true
	TransferService.initWithSSE(
		{
			iban: form.value.from!.iban,
			recIban: form.value.to,
			recFio: form.value.receiverName,
			amount: String(form.value.amount),
			typeOfTransfer: TypeOfTransfer.InternalByAccount
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
}
</script>

<template>
	<div>
		<form class="internal-iban-form" @submit="handleSubmit">
			<div class="internal-iban-form-top">
				<AccountDropdown
					v-model="form.from"
					class="form-field"
					:accounts-groups="ACCOUNTS_GROUPS"
					:label="$t('OWN.FORM.FROM')"
				/>
				<IbanInput
					id="recieverNameModel"
					v-model:model-value="form.to"
					class="form-field"
					:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
					:invalid="!!IbanStore.errors.to"
					:helper-text="IbanStore.errors.to ? $t(IbanStore.errors.to) : ''"
					@update:model-value="IbanStore.clearErrors('to')"
				/>
				<Input
					id="123"
					v-model:model-value="form.receiverName"
					class="form-field"
					:label="$t('INTERNAL.IBAN.FORM.RECIEVER_NAME')"
					:invalid="!!IbanStore.errors.receiverName"
					:helper-text="IbanStore.errors.receiverName ? $t(IbanStore.errors.receiverName) : ''"
					@update:model-value="IbanStore.clearErrors('receiverName')"
				/>
				<CurrencyInput
					id="amount"
					v-model:model-value="form.amount"
					class="form-field"
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
