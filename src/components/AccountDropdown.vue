<script setup lang="ts">
import { computed, ref } from 'vue'

import { BottomSheet, Cell, CellGroup, CellGroupHeader, Dropdown } from '@ui-kit/ui-kit'

import KztIcon from '@ui-kit/kmf-icons/finance/currencies/kzt.svg'
import UsdIcon from '@ui-kit/kmf-icons/finance/currencies/usd.svg'
import CheckIcon from '@ui-kit/kmf-icons/interface/controls/check-mark.svg'

import { Account, AccountsGroup, CURRENCY } from '@/types'
import { maskAmount, maskIban } from '@/utils'

const CURRENCY_ICON = {
	[CURRENCY.KZT]: KztIcon,
	[CURRENCY.USD]: UsdIcon
}

const props = defineProps<{
	id?: string
	label?: string
	accountsGroups?: AccountsGroup[]
	modelValue?: Account | null
	disabled?: Account | null
	value?: Account | undefined | null
	errorInvalid?: boolean
	helperText?: string
	updateField?: Function
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

	if (props.updateField) {
		props.updateField()
	}
}
</script>

<template>
	<div class="accounts">
		<Dropdown
			:id="props.id || ''"
			:value="view.amount"
			:label="view.label"
			:invalid="props.errorInvalid"
			:helper-text="props.helperText"
			@on-focus="accountBottomSheetRef?.open()"
		/>

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
						:reverse="true"
						:class="item.id === props.disabled?.id ? 'cell--disabled' : ''"
						@click="onSelect(item)"
					>
						<template #left>
							<Component :is="CURRENCY_ICON[item.currency]" class="text-white" />
						</template>
						<template #title>{{ item.title }}</template>
						<template #subtitle>
							<span class="text-caption">{{ maskIban(item.iban) }} </span>
						</template>
						<template #right>
							<span v-if="item.id === props.disabled?.id" class="text-green"><CheckIcon /></span>
							<span v-if="item.id !== props.disabled?.id" class="text-caption color-dark">
								{{ maskAmount(item.amount, item.currency) }}
							</span>
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
