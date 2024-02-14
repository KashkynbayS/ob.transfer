<script setup lang="ts">
import { ref, watch } from 'vue'

import { Button, CurrencyInput, IbanInput, Input } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AccountDropdown from '@/components/AccountDropdown.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import KnpDropdown from '@/components/KnpDropdown.vue'

import { ACCOUNTS_GROUPS } from '@/mocks/internal'

import { useFormAutoFill } from '@/helpers/useFormAutoFill.ts'
import router from '@/router'
import { handleTransferSSEResponse } from '@/services/sse.service'
import { TransferService } from '@/services/transfer.service'
import { useExternalStore } from '@/stores/external'
import { useStatusStore } from '@/stores/status'
import { ExternalForm } from '@/types/external'
import { FORM_STATE } from '@/types/form'
import { Knp } from '@/types/knp'
import { TypeOfTransfer } from '@/types/transfer'

const externalStore = useExternalStore()
const statusStore = useStatusStore()
const { formData } = useFormAutoFill()

externalStore.clearErrors()

// Mock for UL
const form = ref<ExternalForm>({
	from: undefined,
	iban: formData.value?.recIban || 'KZ68888AA22040000070',
	knp: null,
	iin: formData.value?.recIin || '871209301136',
	receiverName: formData.value?.recFio || '',
	amount: Number(formData.value?.amount) || null
})

watch(
	() => externalStore.state,
	(state) => {
		switch (state) {
			case FORM_STATE.SUCCESS:
				break

			case FORM_STATE.ERROR:
				statusStore.$state = {
					class: 'error',
					title: 'Перевод не совершён',
					description: 'Ошибка',
					showAs: 'fullpage',
					actions: [
						{
							title: 'Вернуться на главную',
							type: 'secondary',
							target: '_self',
							url: 'https://online-dev.kmf.kz/app/bank/actions/close'
						},
						{ title: 'Обновить документ', type: 'primary', target: '_self', url: '' }
					]
				}
				router.push({
					name: 'Status'
				})
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

const handleSubmit = (e: Event | null = null) => {
	e?.preventDefault()

	externalStore.validate(form.value).then(() => {
		const mapped: any = {
			iban: form.value.from!.iban,
			recIban: form.value.iban,
			recIin: form.value.iin,
			knp: '119',
			kbe: '19',
			recBin: '871209301136',
			recCompany: 'ТОО "АБВГД"',
			// bin_hardcode: '180541000305',
			// recFio: form.value.receiverName,
			amount: String(form.value.amount),
			// kbe: String(Number(form.value.knp?.code)),
			transferDescription: 'отмывание денег',
			typeOfTransfer: TypeOfTransfer.External
		}

		TransferService.initWithSSE(mapped, (event) => {
			externalStore.setState(FORM_STATE.SUCCESS)
			handleTransferSSEResponse(mapped, event, router)
		})
			.then((e) => {
				externalStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
				externalStore.setState(FORM_STATE.SUCCESS)
			})
			.catch(() => {
				externalStore.setState(FORM_STATE.ERROR)
			})
	})
}

const handleKnpUpdate = () => {
	externalStore.clearErrors('knp')
}
</script>

<template>
	<PageTemplate>
		<template #header>
			<AppNavbar>
				<template #title>
					<h5>{{ $t('EXTERNAL.TITLE') }}</h5>
				</template>
			</AppNavbar>
		</template>
		<form class="form" @submit="handleSubmit">
			<AccountDropdown
				id="from"
				v-model="form.from"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('EXTERNAL.FORM.FROM')"
			/>
			<IbanInput
				id="iban"
				v-model="form.iban"
				:label="$t('EXTERNAL.FORM.IBAN')"
				:invalid="!!externalStore.errors.iban"
				:helper-text="!!externalStore.errors.iban ? $t(externalStore.errors.iban) : ''"
				@update:model-value="externalStore.clearErrors('iban')"
			/>
			<KnpDropdown
				id="knp"
				v-model="form.knp as Knp | null"
				:error-invalid="!!externalStore.errors.knp"
				:helper-text="!!externalStore.errors.knp ? $t(externalStore.errors.knp) : ''"
				:update-field="handleKnpUpdate"
			/>
			<Input
				id="iin"
				v-model="form.iin"
				:label="$t('EXTERNAL.FORM.IIN')"
				:invalid="!!externalStore.errors.iin"
				:helper-text="!!externalStore.errors.iin ? $t(externalStore.errors.iin) : ''"
				@update:model-value="externalStore.clearErrors('iin')"
			/>
			<Input
				id="name"
				v-model="form.receiverName"
				:label="$t('EXTERNAL.FORM.PAYMENT_PURPOSES')"
				:invalid="!!externalStore.errors.receiverName"
				:helper-text="!!externalStore.errors.receiverName ? $t(externalStore.errors.receiverName) : ''"
				@update:model-value="externalStore.clearErrors('receiverName')"
			/>
			<CurrencyInput
				id="amount"
				v-model="form.amount"
				:label="$t('EXTERNAL.FORM.AMOUNT')"
				:invalid="!!externalStore.errors.amount"
				:helper-text="!!externalStore.errors.amount ? $t(externalStore.errors.amount) : ''"
				@update:model-value="externalStore.clearErrors('amount')"
			/>

			<Button id="externalSubmit" class="form__submit" type="primary" attr-type="submit" @click="handleSubmit">
				{{ $t('EXTERNAL.SUBMIT') }}
			</Button>
		</form>
	</PageTemplate>
</template>

<style scoped>
.form {
	width: 100%;
	height: 100%;
	flex-direction: column;
	display: flex;
	gap: var(--space-3);
}

.form__submit {
	margin-top: auto;
}
</style>
