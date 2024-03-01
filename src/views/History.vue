<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import DepositIcon from '@/assets/icons/deposit.svg'
import TransfersIcon from '@ui-kit/kmf-icons/finance/transfers/transfers.svg'

import KmfSemifilledIcon from '@ui-kit/kmf-icons/logos/kmf-semifilled.svg'
import { Cell, CellGroup } from '@ui-kit/ui-kit'


import ArrowRoundIcon from '@/assets/icons/arrow-round.svg'
import FiltersIcon from '@/assets/icons/filters.svg'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTags from '@/components/AppTags.vue'
import HistorySettings from '@/components/HistorySettings.vue'
import { useHistoryStore } from '@/stores/history.ts'
import { CURRENCY, HistoryGroup, HistoryItem, Tag } from '@/types'
import { TypeOfTransfer } from '@/types/transfer.ts'
import { maskIban, maskPhoneNumber } from '@/utils'
import { useI18n } from 'vue-i18n'
// import AccountNewIcon from '@ui-kit/kmf-icons/finance/accounts/account-new.svg'

const { t } = useI18n();
const router = useRouter()
const historyStore = useHistoryStore()

// const typeMapping: Record<TypeOfTransfer, string> = {
// 	[TypeOfTransfer.Conversion]: 'HISTORY.TYPE_OF_TRANSFER.USD_CONVERTION',
// 	[TypeOfTransfer.DepositReplenishment]: 'HISTORY.TYPE_OF_TRANSFER.OWN',
// 	[TypeOfTransfer.DepositWithdrawal]: 'HISTORY.TYPE_OF_TRANSFER.OWN',
// 	[TypeOfTransfer.InternalPhone]: 'HISTORY.TYPE_OF_TRANSFER.INTERNAL',
// 	[TypeOfTransfer.InternalIban]: 'HISTORY.TYPE_OF_TRANSFER.INTERNAL',
// 	[TypeOfTransfer.External]: 'HISTORY.TYPE_OF_TRANSFER.EXTERNAL'
// }

// const transferMapping: Record<TypeOfTransfer, string> = {
// 	[TypeOfTransfer.Conversion]: 'HISTORY.TYPE_OF_TRANSFER.USD_CONVERTION',
// 	[TypeOfTransfer.DepositReplenishment]: 'HISTORY.TYPE_OF_TRANSFER.OWN',
// 	[TypeOfTransfer.DepositWithdrawal]: 'HISTORY.TYPE_OF_TRANSFER.OWN',
// 	[TypeOfTransfer.InternalPhone]: 'HISTORY.TYPE_OF_TRANSFER.INTERNAL',
// 	[TypeOfTransfer.InternalIban]: 'HISTORY.TYPE_OF_TRANSFER.INTERNAL',
// 	[TypeOfTransfer.External]: 'HISTORY.TYPE_OF_TRANSFER.EXTERNAL'
// }

const mapDescription = (transaction: HistoryItem) => {
	switch (transaction.typeOfTransfer) {
		case TypeOfTransfer.Conversion:
			return 'HISTORY.TRANSACTION_DESCRIPTION.CONVERSION'
		case TypeOfTransfer.DepositReplenishment:
			return 'HISTORY.TRANSACTION_DESCRIPTION.REPLENISHMENT'
		case TypeOfTransfer.DepositWithdrawal:
			return 'HISTORY.TRANSACTION_DESCRIPTION.WITHDRAWAL'
		case TypeOfTransfer.InternalPhone:
		case TypeOfTransfer.InternalIban:
			return 'HISTORY.TRANSACTION_DESCRIPTION.INTERNAL'
		case TypeOfTransfer.External:
			return 'HISTORY.TRANSACTION_DESCRIPTION.EXTERNAL'
		default:
			return 'HISTORY.TRANSACTION_DESCRIPTION.UNKNOWN'
	}
}

const mapInternalTitle = (transaction: HistoryItem) => {
	if (transaction.recFio) {
		return transaction.recFio
	}
	if (transaction.recMobileNumber) {
		return t('HISTORY.TRANSACTION_TITLE.PHONE', { phone: maskPhoneNumber(transaction.recMobileNumber) })
	}
	return t('HISTORY.TRANSACTION_TITLE.UNKNOWN', { currency: CURRENCY.KZT.toUpperCase() })
}

const mapTitle = (transaction: HistoryItem) => {
	switch (transaction.typeOfTransfer) {
		case TypeOfTransfer.Conversion:
			return t('HISTORY.TRANSACTION_TITLE.CONVERSION', { currency: CURRENCY.KZT.toUpperCase() })
		case TypeOfTransfer.DepositReplenishment:
			return t('HISTORY.TRANSACTION_TITLE.REPLENISHMENT', { deposit: `*${transaction.recIban?.slice(-4)}` })
		case TypeOfTransfer.DepositWithdrawal:
			return t('HISTORY.TRANSACTION_TITLE.WITHDRAWAL', { currency: CURRENCY.KZT.toUpperCase() })
		case TypeOfTransfer.InternalPhone:
		case TypeOfTransfer.InternalIban:
			return mapInternalTitle(transaction)
		case TypeOfTransfer.External:
			return t('HISTORY.TRANSACTION_TITLE.EXTERNAL', { account: transaction.recIban ? maskIban(transaction.recIban) : '' })
		default:
			return t('HISTORY.TRANSACTION_TITLE.UNKNOWN', { currency: CURRENCY.KZT.toUpperCase() })
	}
}

const mapIcon = (type: TypeOfTransfer) => {
	switch (type) {
		case TypeOfTransfer.Conversion:
			return ArrowRoundIcon
		case TypeOfTransfer.DepositReplenishment:
		case TypeOfTransfer.DepositWithdrawal:
			return DepositIcon
		case TypeOfTransfer.External:
			return TransfersIcon
		case TypeOfTransfer.InternalPhone:
		case TypeOfTransfer.InternalIban:
			return KmfSemifilledIcon
		default:
			return ArrowRoundIcon
	}
}

const history = computed<HistoryGroup[]>(() => historyStore.transformedHistory)

const openDetails = (id: string) => {
	router.push({
		name: 'Details',
		params: {
			id
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

watchEffect(() => {
	console.log(historyStore.transformedHistory)
})
</script>

<template>
	<div class="history">
		<AppNavbar>
			<template #title>
				<h5>{{ $t('HISTORY.TITLE') }}</h5>
			</template>
			<template #label>
				<button id="history-filters-btn" class="history__filters" @click="openSettings">
					<FiltersIcon />
				</button>
			</template>
		</AppNavbar>

		<AppTags class="history__tags" :tags="filters" @removed="removeHandler" />

		<CellGroup v-for="group in history" :key="group.title" class="transaction-group">
			<div class="transaction-group__title">
				{{ group.isTitleWithTranslation ? $t(group.title) : group.title }}
			</div>
			<Cell reverse v-for="item in group.list" :key="item.id" left-color="var(--text-low-contrast)" left-type="icon"
				left-bg="var(--bg-dark)" @click="openDetails(item.id)">
				<template #left>
					{{ item.typeOfTransfer }}
					<Component :is="mapIcon(item.typeOfTransfer)" />
				</template>
				<template #title>{{ mapTitle(item) }}</template>
				<template #subtitle><span class="text-caption">{{ $t(mapDescription(item)) }}</span></template>
				<!-- 
				<template #right>
					<div class="history__value">
						<TransactionValue :transaction="transaction" />
						<span v-if="transaction.commission" class="history__commission">
							-{{ transaction.commission }}
							{{ CURRENCY_SYMBOL[transaction.currency] }}
						</span>
					</div>
				</template> -->
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
