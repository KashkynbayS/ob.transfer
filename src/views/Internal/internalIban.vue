<script setup lang="ts">
import KztIcon from '@ui-kit/kmf-icons/finance/currencies/kzt.svg'
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

const formModel = ref({
	accountFromModel: '',
	accountToModel: '',
	recieverNameModel: '',
	sumModel: ''
})

// Guard
onBeforeRouteLeave((to, from, next) => {
	const { accountFromModel, accountToModel, recieverNameModel, sumModel } = formModel.value
	const isFormDirty = accountFromModel || accountToModel || recieverNameModel || sumModel
	destPath = to.fullPath

	if (!isFormDirty || isLeaveConfirmed) {
		next(true)
	}

	modal.value?.open()
})
</script>

<template>
	<form class="internal-iban-form">
		<div class="internal-iban-form-top">
			<Input
				v-model:model-value="formModel.accountFromModel"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_FROM')"
			>
				<template #prepend>
					<KztIcon />
				</template>
			</Input>

			<Input
				v-model:model-value="formModel.accountToModel"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
			/>
			<Input
				v-model:model-value="formModel.recieverNameModel"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.RECIEVER_NAME')"
			/>
			<Input v-model:model-value="formModel.sumModel" class="form-field" :label="$t('INTERNAL.IBAN.FORM.SUM')" />
		</div>
		<div class="internal-iban-form-bottom">
			<Button type="primary"> {{ $t('INTERNAL.IBAN.FORM.SUBMIT') }} </Button>
		</div>
	</form>

	<Modal ref="modal" v-bind="{ asd: 'asdasd' }" :actions="actions" close-on-outline-click>
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
