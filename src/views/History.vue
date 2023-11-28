<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AccountNewIcon from '@ui-kit/kmf-icons/finance/accounts/account-new.svg'
import TransfersIcon from '@ui-kit/kmf-icons/finance/transfers/transfers.svg'
import ArrowRoundIcon from '@/assets/icons/arrow-round.svg'
import FiltersIcon from '@/assets/icons/filters.svg'
import { Cell, CellGroup } from '@ui-kit/ui-kit'
import { useRouter } from 'vue-router'
import { CURRENCY, TransactionGroup, TransactionsType } from '@/types'
import TransactionValue from '@/components/TransactionValue.vue'
import { CURRENCY_SYMBOL } from '@/constants'

const router = useRouter()

const typeMapping: Record<TransactionsType, string> = {
	fill: 'Пополнение',
	payment: 'Покупка',
	transferByAccount: 'Перевод на счет',
	transferByPhone: 'Перевод по номеру'
}

const typeIconMapping: Record<TransactionsType, string> = {
	fill: AccountNewIcon,
	payment: ArrowRoundIcon,
	transferByAccount: TransfersIcon,
	transferByPhone: TransfersIcon
}

const transactions: TransactionGroup[] = [
	{
		title: 'Вчера',
		list: [
			{
				type: 'fill',
				currency: CURRENCY.KZT,
				caption: '12:56',
				value: 8888889.99,
				status: 'credited',
				id: '123'
			},
			{
				type: 'payment',
				currency: CURRENCY.USD,
				caption: '11:00',
				commission: 1.5,
				value: 300,
				id: '123',
				status: 'removed'
			},
			{
				type: 'transferByAccount',
				currency: CURRENCY.KZT,
				caption: '10:43',
				value: 6800,
				id: '123',
				status: 'removed'
			}
		]
	},
	{
		title: '5 ноября',
		list: [
			{
				type: 'fill',
				currency: CURRENCY.KZT,
				caption: '12:56',
				value: 8888889.99,
				id: '123',
				status: 'waiting'
			},
			{
				type: 'payment',
				currency: CURRENCY.USD,
				caption: '11:00',
				value: 300,
				id: '123',
				status: 'transferred'
			},
			{
				type: 'transferByAccount',
				currency: CURRENCY.KZT,
				caption: '10:43',
				commission: 150,
				value: 6800,
				id: '123',
				status: 'removed'
			}
		]
	}
]

const openDetails = (id: string) => {
	router.push({
		name: 'TransactionDetails',
		params: {
			transactionId: id
		}
	})
}
</script>

<template>
	<div class="history">
		<AppNavbar>
			<template #title><h5>История</h5></template>
			<template #label>
				<button id="history-filters-btn" class="history__filters">
					<FiltersIcon />
				</button>
			</template>
		</AppNavbar>

		<CellGroup v-for="transactionGroup in transactions" :key="transactionGroup.title" class="transaction-group">
			<div class="transaction-group__title">
				{{ transactionGroup.title }}
			</div>
			<Cell
				v-for="transaction in transactionGroup.list"
				:key="transaction.id"
				left-color="var(--low-contrast)"
				@click="openDetails(transaction.id)"
			>
				<template #left>
					<div class="history__icon">
						<Component :is="typeIconMapping[transaction.type]" />
					</div>
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
	</div>
</template>

<style scoped lang="scss">
.history {
	&__icon {
		width: 48px;
		height: 44px;
		background-color: var(--bg-dark);
		border-radius: var(--border-radius-s);
		display: flex;
		align-items: center;
		justify-content: center;
	}

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
}

.transaction-group {
	&:not(:last-child) {
		margin-bottom: var(--space-3);
	}

	&__title {
		color: var(--text-low-contrast);
		font-size: var(--font-size-caption);
		line-height: var(--line-height-caption);
		padding-top: var(--space-6);
		padding-left: var(--space-4);
	}
}
</style>
