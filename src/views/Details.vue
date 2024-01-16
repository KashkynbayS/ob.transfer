<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import ArrowRoundIcon from '@/assets/icons/arrow-round.svg'
import ShareIcon from '@/assets/icons/share.svg'
import { Button, Cell, CellGroup, CellGroupHeader } from '@ui-kit/ui-kit'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/history.ts'
import { FormParams, TransactionStatus } from '@/types'
import { useFormAutoFill } from '@/helpers/useFormAutoFill.ts'

const route = useRoute()
const historyStore = useHistoryStore()
const { routerPushWithData } = useFormAutoFill()

const transactionId = computed(() => route.params.transactionId as string)
const details = computed(() => historyStore.getTransactionById(transactionId.value))

const statuses: Record<TransactionStatus, string> = {
	success: 'Исполнено',
	in_progress: 'В процессе'
}

function formatDateTime(inputString: string | undefined): string {
	if (!inputString) {
		return ''
	}

	const date = new Date(inputString)
	const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }
	return date.toLocaleDateString('ru-RU', options)
}

const formattedDateTime = computed(() => formatDateTime(details.value?.createdAt))

function formatIban(input: string): string {
	if (input.length !== 20) {
		throw new Error('Неверный формат IBAN')
	}

	return `${input.slice(0, 4)} ${input.slice(4, 8)} ${input.slice(8, 12)} ${input.slice(12, 16)} ${input.slice(16)}`
}

function repeatAction() {
	const params: FormParams = {}

	if (details.value?.amount) params.amount = String(details.value.amount)
	if (details.value?.recMobileNumber) params.recMobileNumber = details.value.recMobileNumber
	if (details.value?.recIban) params.recIban = details.value.recIban
	if (details.value?.recIin) params.recIin = details.value.recIin
	if (details.value?.recFio) params.recFio = details.value.recFio
	if (details.value?.iban) params.iban = details.value.iban
	if (details.value?.kbe) params.kbe = details.value.kbe
	routerPushWithData('External', params)
}

onMounted(() => {
	historyStore.fetchHistory()
})
</script>

<template>
	<div class="details">
		<AppNavbar>
			<template #title><h5>Детали платежа</h5></template>
		</AppNavbar>

		<template v-if="details">
			<div class="details__value">-{{ details.amount }} ₸</div>
			<div class="details__info">
				<span class="details__status">{{ statuses[details.status] }}</span>
				•
				<span class="details__date">{{ formattedDateTime }}</span>
			</div>

			<div class="details__actions">
				<Button id="share-details-btn">
					<ShareIcon style="width: auto; height: auto" />
					Поделиться
				</Button>
				<Button id="repeat-details-btn" type="secondary-gray" @click="repeatAction">
					<ArrowRoundIcon />
					Повторить
				</Button>
			</div>

			<CellGroup type="island">
				<CellGroupHeader>
					<template #title>Детали списания</template>
				</CellGroupHeader>
				<Cell>
					<template #subtitle>Счет списания</template>
					<template #title>{{ formatIban(details.iban) }}</template>
				</Cell>
				<Cell>
					<template #subtitle>Комиссия</template>
					<template #title>{{ details.commission || 0 }} ₸</template>
				</Cell>
			</CellGroup>

			<CellGroup type="island">
				<CellGroupHeader>
					<template #title>Получатель</template>
				</CellGroupHeader>
				<Cell>
					<template #subtitle>Счет зачисления</template>
					<template #title>{{ formatIban(details.recIban) }}</template>
				</Cell>
				<Cell>
					<template #subtitle>Номер квитанции</template>
					<template #title>56789900</template>
				</Cell>
				<Cell>
					<template #subtitle>Имя получателя</template>
					<template #title>{{ details.recFio }}</template>
				</Cell>
			</CellGroup>
		</template>
	</div>
</template>

<style scoped lang="scss">
.details {
	&__value {
		display: flex;
		flex-direction: column;
		font-size: var(--font-size-heading-1);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-heading-1);
		padding: var(--space-4) var(--space-4) var(--space-1) var(--space-4);
	}

	&__info {
		padding: 0 var(--space-4);
		color: var(--text-low-contrast);
		margin-bottom: var(--space-6);
	}

	&__status {
		color: var(--text-high-contrast);
	}

	&__actions {
		display: flex;
		padding: 0 var(--space-4);
		gap: var(--space-4);
	}
}
</style>
