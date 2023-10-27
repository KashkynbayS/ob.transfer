<script setup lang="ts">
import { ref, computed } from 'vue'

import { Dropdown, BottomSheet, Cell, CellGroup, CellGroupHeader } from '@ui-kit/ui-kit'

import KztIcon from '@ui-kit/kmf-icons/finance/currencies/kzt.svg'
import UsdIcon from '@ui-kit/kmf-icons/finance/currencies/usd.svg'
import CheckIcon from '@ui-kit/kmf-icons/interface/controls/check-mark.svg'

import { AccountsGroup, Account, CURRENCY } from '@/types'
import { maskAmount, maskIban } from '@/utils'

const CURRENCY_ICON = {
	[CURRENCY.KZT]: KztIcon,
	[CURRENCY.USD]: UsdIcon
}

const props = defineProps<{
	id?: string
	label?: string
	accountsGroups?: AccountsGroup[]
	modelValue?: Account
	disabled?: Account
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', val: Account): void
}>()

const selected = ref<Account | null>(props.modelValue || null)
const accountBottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)

const view = computed(() => {
	return {
		label: selected.value?.title || props.label || '',
		amount: maskAmount(selected.value?.amount, selected.value?.currency)
	}
})

const onSelect = (item: Account) => {
	if (props.disabled?.id === item.id) {
		return
	}

	selected.value = item
	emit('update:modelValue', item)
	accountBottomSheetRef.value?.close()
}
</script>

<template>
	<div class="accounts">
		<Dropdown :id="props.id || ''" :value="view.amount" :label="view.label" @on-focus="accountBottomSheetRef?.open()" />

		<BottomSheet ref="accountBottomSheetRef">
			<template #title>
				<h4>{{ props.label }}</h4>
			</template>
			<template #content>
				<CellGroup v-for="group in props.accountsGroups" :key="group.id" class="group">
					<CellGroupHeader class="header">
						<template #title>
							<strong class="text-content text-low-contrast text-semibold">{{ group.title }}</strong>
						</template>
					</CellGroupHeader>

					<Cell
						v-for="item in group.list"
						:key="item.id"
						left-bg="#6E757C"
						:class="item.id === props.disabled?.id ? 'cell--disabled' : ''"
						@click="onSelect(item)"
					>
						<template #left>
							<Component :is="CURRENCY_ICON[item.currency]" class="text-white" />
						</template>
						<template #title>{{ item.title }}</template>
						<template #subtitle>{{ maskIban(item.iban) }}</template>
						<template #right>
							<span v-if="item.id === props.disabled?.id" class="text-green"><CheckIcon /></span>
							<span v-if="item.id !== props.disabled?.id">{{ maskAmount(item.amount, item.currency) }}</span>
						</template>
					</Cell>
				</CellGroup>
			</template>
		</BottomSheet>
	</div>
</template>

<style scoped>
.accounts {
	width: 100%;
}

.cell--disabled {
	opacity: 0.4;
}

.header {
	background-color: transparent;
}
.group {
	padding: 0;
	margin: 0;
}
</style>
