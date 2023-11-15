<script setup lang="ts">
import AccountDropdown from '@/components/AccountDropdown.vue'
import TransferDetailsBottomSheet from '@/components/transferDetailsBottomSheet.vue'
import { ACCOUNTS_GROUPS } from '@/mocks/internal'
import { useTransferDetailsStore } from '@/stores/transferDetails.ts'
import { Account } from '@/types'
import { Button, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { SelectContactInput } from '@ui-kit/ui-kit/dist/widgets'
import { reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import * as Yup from 'yup'

const transferDetailsStore = useTransferDetailsStore()

const form = reactive({
	accountFrom: null as Account | null,
	phoneNumber: '',
	amount: ''
})

const errors = reactive({
	accountFrom: '',
	phoneNumber: '',
	amount: ''
})

const transferredAmount = 567890 // сумма который был переведен в день
const ResidualAmount = 1000000 - transferredAmount // остаток суммы перевода в день

// Validation
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

const isAmountInvalid = ref(false)

async function validateAmount() {
	if (form.amount.trim() === '') {
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

const handleSubmit = () => {
	validateAmount()
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
// _________________________________________
</script>

<template>
	<form class="internal-phone-form">
		<div class="internal-phone-form-top">
			<AccountDropdown
				id="from"
				v-model="form.accountFrom as Account | null | undefined"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.FROM')"
			/>

			<SelectContactInput />

			<Input
				id="123"
				v-model="form.amount"
				class="form-field"
				:label="$t('INTERNAL.PHONE.FORM.SUM')"
				:invalid="isAmountInvalid"
				:helper-text="errors.amount"
			/>
		</div>
		<div class="internal-phone-form-bottom">
			<Button
				id="123"
				type="primary"
				style="margin-bottom: var(--space-1)"
				@click="transferDetailsStore.openBottomSheet()"
				>Детали</Button
			>
			<Button id="123" type="primary" @click="handleSubmit"> {{ $t('INTERNAL.PHONE.FORM.SUBMIT') }} </Button>
		</div>
	</form>

	<TransferDetailsBottomSheet />

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
