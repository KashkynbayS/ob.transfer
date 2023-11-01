<script setup lang="ts">
import AccountDropdown from '@/components/AccountDropdown.vue'
import { ACCOUNTS_GROUPS } from '@/mocks/internal'
import { Button, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

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

// Submit handler
const onSubmit = () => {}

const form = reactive({
	accountFrom: null,
	accountTo: '',
	recieverNameModel: '',
	amount: ''
})

// Guard
onBeforeRouteLeave((to, _, next) => {
	const { accountFrom, accountTo, recieverNameModel, amount } = form
	const isFormDirty = accountFrom || accountTo || recieverNameModel || amount
	destPath = to.fullPath

	if (!isFormDirty || isLeaveConfirmed) {
		next(true)
	}

	modal.value?.open()
})
</script>

<template>
	<form class="internal-iban-form" @submit="onSubmit">
		<div class="internal-iban-form-top">
			<AccountDropdown
				v-model="form.accountFrom"
				class="form-field"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.TO')"
			/>
			<Input
				id="123"
				v-model:model-value="form.accountTo"
				:invalid="!!form.accountTo"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
			/>
			<Input
				id="123"
				v-model:model-value="form.recieverNameModel"
				:invalid="!!form.recieverNameModel"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.RECIEVER_NAME')"
			/>
			<Input
				id="123"
				v-model:model-value="form.amount"
				:invalid="!!form.amount"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.SUM')"
			/>
			<span>{{ form.amount }}</span>
		</div>
		<div class="internal-iban-form-bottom">
			<Button id="internal-iban-submit" type="primary" @click="onSubmit">
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
	.internal-iban-form-error-message {
	}
}
</style>
