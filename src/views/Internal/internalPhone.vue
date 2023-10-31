<script setup lang="ts">
import KztIcon from '@ui-kit/kmf-icons/finance/currencies/kzt.svg'
import User from '@ui-kit/kmf-icons/interface/users/user.svg'
import { BottomSheet, Button, Cell, CellGroup, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { computed, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

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

const formModel = ref({
	accountFromModel: '',
	phoneNumber: '',
	sumModel: ''
})

// Guard
onBeforeRouteLeave((to, _, next) => {
	const { accountFromModel, phoneNumber, sumModel } = formModel.value
	const isFormDirty = accountFromModel || phoneNumber || sumModel
	destPath = to.fullPath

	if (!isFormDirty || isLeaveConfiirmed) {
		next(true)
	}

	modal.value?.open()
})

// _________________________________________

const contact = reactive({
	value: '',
	search: '',
	list: [
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Sultan', phoneNumber: 87053811230 },
		{ name: 'Yernar', phoneNumber: 87053811230 }
	]
})

const filteredContactList = computed(() =>
	contact.list.filter((item) => item.name?.toLowerCase().includes(contact.search.toLowerCase()))
)

const contactBottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)
</script>

<template>
	<form class="internal-phone-form">
		<div class="internal-phone-form-top">
			<Input
				id="123"
				v-model:model-value="formModel.accountFromModel"
				class="form-field"
				:label="$t('INTERNAL.PHONE.FORM.ACCOUNT_FROM')"
			>
				<template #prepend>
					<KztIcon />
				</template>
			</Input>

			<Input
				id="123"
				v-model:model-value="formModel.phoneNumber"
				class="form-field"
				:label="$t('INTERNAL.PHONE.FORM.PHONE_NUMBER')"
			>
				<template #append>
					<User @click="contactBottomSheetRef?.open()" />
				</template>
			</Input>

			<Input
				id="123"
				v-model:model-value="formModel.sumModel"
				class="form-field"
				:label="$t('INTERNAL.PHONE.FORM.SUM')"
			/>
		</div>
		<div class="internal-phone-form-bottom">
			<Button id="123" type="primary"> {{ $t('INTERNAL.PHONE.FORM.SUBMIT') }} </Button>
		</div>
	</form>

	<BottomSheet ref="contactBottomSheetRef">
		<template #title><h4>Контакты</h4></template>
		<template #content>
			<div class="address__bottom-sheet-content">
				<Input id="contact-search" v-model="contact.search" placeholder="Поиск по названию" type="search" />
				<CellGroup>
					<Cell v-for="item in filteredContactList" :key="item.phoneNumber">
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

	.form-field {
		padding-bottom: var(--space-3);
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
