<script setup lang="ts">
import { useTransferDetailsStore } from '@/stores/transferDetails.ts'
import { BottomSheet, Cell, CellGroup } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { computed, reactive, ref, watch } from 'vue'

const transferDetailsStore = useTransferDetailsStore()
const conditions = computed(() => transferDetailsStore.conditions)

const bottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)

watch(
	() => transferDetailsStore.show,
	(newValue) => {
		if (newValue) {
			bottomSheetRef.value?.open()
		}
	}
)

const actions = reactive<ModalAction[]>([
	{
		mode: 'ghost',
		title: 'Добавить в избранное',
		autoClose: false
		// action: () =>
	},
	{
		mode: 'primary',
		title: 'Поделиться',
		autoClose: false
		// action: () =>
	}
])
</script>

<template>
	<BottomSheet
		ref="bottomSheetRef"
		:actions="actions"
		close-on-outline-click
		class="bottom-sheet"
		@closed="transferDetailsStore.closeBottomSheet()"
	>
		<template #title>Детали перевода</template>

		<template #content>
			<CellGroup type="full" class="bottom-sheet__content">
				<Cell v-for="item in conditions" :key="item.key">
					<template #title>{{ item.key }}</template>
					<template #right>
						<span class="text-low-contrast" :class="{ success: item.status === true }">{{ item.value }}</span>
					</template>
				</Cell>
			</CellGroup>
		</template>
	</BottomSheet>
</template>

<style scoped lang="scss">
.bottom-sheet__content {
	padding: 0;

	.success {
		color: var(--success-primary);
	}
}
</style>
