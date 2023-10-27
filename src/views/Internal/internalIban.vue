<script setup lang="ts">
import KztIcon from '@ui-kit/kmf-icons/finance/currencies/kzt.svg'
import { Button, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { toTypedSchema } from '@vee-validate/yup'
import { useForm } from 'vee-validate'
import { reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import * as yup from 'yup'

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

const schema = toTypedSchema(
	yup.object({
		accountFromModel: yup.string().required(),
		accountToModel: yup.string().required(),
		recieverNameModel: yup.string().required(),
		sumModel: yup.number().required().min(100).max(1000)
	})
)
const { errors, values, defineInputBinds, handleSubmit } = useForm({
	validationSchema: schema
})

// Define fields
const accountFromModel = defineInputBinds('accountFromModel')
const accountToModel = defineInputBinds('accountToModel')
const recieverNameModel = defineInputBinds('recieverNameModel')
const sumModel = defineInputBinds('sumModel')

// Submit handler
const onSubmit = handleSubmit((values) => {
	console.log(values)
})

// Guard
onBeforeRouteLeave((to, from, next) => {
	console.log(from)

	const { accountFromModel, accountToModel, recieverNameModel, sumModel } = values
	const isFormDirty = accountFromModel || accountToModel || recieverNameModel || sumModel
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
			<Input
<<<<<<< HEAD
				id="internalIbanInput"
				:invalid="!!errors.accountFromModel"
=======
>>>>>>> e9d7241 (fixed styles)
				v-bind="accountFromModel"
				:invalid="!!errors.accountFromModel"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_FROM')"
			>
				<template #prepend>
					<KztIcon />
				</template>
			</Input>
			<Input
				v-bind="accountToModel"
				:invalid="!!errors.accountToModel"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
			/>
			<Input
				:invalid="!!errors.recieverNameModel"
				v-bind="recieverNameModel"
				class="form-field"
				:label="$t('INTERNAL.IBAN.FORM.RECIEVER_NAME')"
			/>
			<Input :invalid="!!errors.sumModel" v-bind="sumModel" class="form-field" :label="$t('INTERNAL.IBAN.FORM.SUM')" />
			<span>{{ errors.sumModel }}</span>
		</div>
		<div class="internal-iban-form-bottom">
			<Button type="primary"> {{ $t('INTERNAL.IBAN.FORM.SUBMIT') }} </Button>
		</div>
	</form>

	<Modal ref="modal" :actions="actions" close-on-outline-click>
		<template #title>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.TITLE') }}</template>
		<template #body>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.SUBTITLE') }}</template>
	</Modal>
</template>

<style lang="scss">
.segment-picker__item {
	width: 50%;
}
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
