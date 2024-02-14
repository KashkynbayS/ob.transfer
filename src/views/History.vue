<script setup lang="ts">
import ArrowRoundIcon from '@/assets/icons/arrow-round.svg'
import FiltersIcon from '@/assets/icons/filters.svg'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTags from '@/components/AppTags.vue'
import HistorySettings from '@/components/HistorySettings.vue'
import TransactionValue from '@/components/TransactionValue.vue'
import { CURRENCY_SYMBOL } from '@/constants'
import { useHistoryStore } from '@/stores/history.ts'
import { Tag, TransactionGroup } from '@/types'
import { TypeOfTransfer } from '@/types/transfer.ts'
import AccountNewIcon from '@ui-kit/kmf-icons/finance/accounts/account-new.svg'
import TransfersIcon from '@ui-kit/kmf-icons/finance/transfers/transfers.svg'
import { Cell, CellGroup } from '@ui-kit/ui-kit'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const historyStore = useHistoryStore()

// TODO: вынести локализацию
const typeMapping: Record<TypeOfTransfer, string> = {
	[TypeOfTransfer.BetweenMyAccountsConversionUSD]:'Конвертация',
	[TypeOfTransfer.BetweenMyAccountsDepositReplenishment]:'Пополнение депозита',
	[TypeOfTransfer.BetweenMyAccountsWithdrawalFromDeposit]:'Снятие с депозита',
	[TypeOfTransfer.InternalByPhone]:'По номеру телефона',
	[TypeOfTransfer.InternalByAccount]:'По номеру счета',
	[TypeOfTransfer.External]: 'Внешний'
}

const typeIconMapping: Record<TypeOfTransfer, string> = {
	[TypeOfTransfer.BetweenMyAccountsConversionUSD]:ArrowRoundIcon,
	[TypeOfTransfer.BetweenMyAccountsDepositReplenishment]:ArrowRoundIcon,
	[TypeOfTransfer.BetweenMyAccountsWithdrawalFromDeposit]:ArrowRoundIcon,
	[TypeOfTransfer.InternalByPhone]:TransfersIcon,
	[TypeOfTransfer.InternalByAccount]:TransfersIcon,
	[TypeOfTransfer.External]: AccountNewIcon
}

const history = computed<TransactionGroup[]>(() => historyStore.transformedHistory)

const openDetails = (id: string) => {
	router.push({
		name: 'TransactionDetails',
		params: {
			transactionId: id
		}
	})
}

const settings = ref(false)
const filters = ref<Tag[]>([])

const openSettings = () => {
	settings.value = true
}

const closeSettings = () => {
	settings.value = false
}

const applySettings = () => {
	filters.value = historyStore.filterTags
	closeSettings()
	historyStore.fetchHistory()
}

const removeHandler = (filterValue: string) => {
	historyStore.disableFilter(filterValue)
	filters.value = historyStore.filterTags
	historyStore.fetchHistory()
}

onMounted(() => {
	historyStore.fetchHistory()
})
</script>

<template>
	<div class="history">
		<AppNavbar>
			<template #title><h5>История</h5></template>
			<template #label>
				<button id="history-filters-btn" class="history__filters" @click="openSettings">
					<FiltersIcon />
				</button>
			</template>
		</AppNavbar>

		<AppTags class="history__tags" :tags="filters" @removed="removeHandler" />

		<CellGroup v-for="transactionGroup in history" :key="transactionGroup.title" class="transaction-group">
			<div class="transaction-group__title">
				{{ transactionGroup.title }}
			</div>
			<Cell
				v-for="transaction in transactionGroup.list"
				:key="transaction.id"
				left-color="var(--low-contrast)"
				left-type="icon"
				left-bg="var(--bg-dark)"
				@click="openDetails(transaction.id)"
			>
				<template #left>
					<Component :is="typeIconMapping[transaction.type]" />
				</template>
				<template #title>{{ typeMapping[transaction.type] }}</template>
				<template #subtitle>{{ transaction.caption }}</template>
				<template #right>
					<div class="history__value">
						<TransactionValue :transaction="transaction" />
						<span v-if="transaction.commission" class="history__commission">
							-{{ transaction.commission }}
							{{ CURRENCY_SYMBOL[transaction.currency] }}
						</span>
					</div>
				</template>
			</Cell>
		</CellGroup>

		<div v-if="historyStore.errorMsg" class="history__error">{{ historyStore.errorMsg }}</div>

		<HistorySettings :show="settings" @closed="closeSettings" @apply="applySettings" />
	</div>
</template>

<style scoped lang="scss">
.history {
	&__filters {
		display: flex;
	}

	&__value {
		display: flex;
		flex-direction: column;
		font-size: var(--font-size-caption);
		line-height: var(--line-height-caption);
	}

	&__commission {
		color: var(--text-low-contrast);
	}

	&__tags {
		padding: var(--space-4) var(--space-4) 0 var(--space-4);
	}

	&__error {
		text-align: center;
		margin: 40dvh var(--space-10);
		font-size: var(--font-size-subtitle);
		line-height: var(--line-height-subtitle);
		color: var(--text-error);
	}
}

.transaction-group {
	&:not(:last-child) {
		margin-bottom: var(--space-6);
	}

	&__title {
		color: var(--text-low-contrast);
		font-size: var(--font-size-caption);
		line-height: var(--line-height-caption);
		padding-left: var(--space-4);
	}
}
</style>
