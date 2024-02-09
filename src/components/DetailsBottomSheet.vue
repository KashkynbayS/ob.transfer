<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { BottomSheet, Cell, CellGroup } from '@ui-kit/ui-kit';
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types';

import { addToFavorites } from '@/services/frequent.service';

import { useTransferDetailsStore } from '@/stores/transferDetails.ts';
import { useApplicationIDStore } from '@/stores/useApplicationIDStore';

const transferDetailsStore = useTransferDetailsStore()
const applicationIDStore = useApplicationIDStore()

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
		autoClose: false,
		action: async () => {
			const applicationID = applicationIDStore.applicationID
			console.log('applicationID in the details: ' + applicationID);
			
			if (applicationID !== null) {
				try {
					const addedItem = await addToFavorites.post(applicationID)
					console.log('Перевод успешно добавлен в избранное:', addedItem);
				} catch (error) {
					console.error('Ошибка при добавлении в избранное:', error);
				}
			}
		}
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
		<template #title>{{ $t('TRANSFER_DETAILS.TITLE') }}</template>

		<template #content>
			<CellGroup type="full" class="bottom-sheet__content">
				<Cell v-for="item in conditions" :key="item.key">
					<template #title>{{ $t(item.key) }}</template>
					<template #right>
						<span class="text-low-contrast" :class="{ success: item.status === true }">{{ $t(item.value) }}</span>
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
