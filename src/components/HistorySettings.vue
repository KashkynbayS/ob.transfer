<script setup lang="ts">
import { BottomSheet, SelectButtons, Input, Button } from '@ui-kit/ui-kit'
import CalendarIcon from '@ui-kit/kmf-icons/others/calendars/calendar.svg'
import { reactive, ref, watch } from 'vue'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { HistoryFilter } from '@/stores/details.ts'

const props = defineProps<{
	show: boolean
	actions?: ModalAction[]
}>()

const emit = defineEmits(['closed'])

watch(
	() => props.show,
	(newValue) => {
		if (newValue) {
			bottomSheetRef.value?.open()
		} else {
			bottomSheetRef.value?.close()
		}
	}
)

const bottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)

const filterModel = ref('')
const dates = ref('')
const sumFrom = ref('')
const sumTo = ref('')

const filters = reactive<
	{
		id: HistoryFilter | 'all'
		title: string
		value: HistoryFilter | 'all'
		disabled: boolean
	}[]
>([
	{ id: 'all', title: 'Все', value: 'all', disabled: false },
	{ id: 'executed', title: 'Исполнено', value: 'executed', disabled: false },
	{ id: 'rejected', title: 'Отклонено', value: 'rejected', disabled: false },
	{ id: 'processing', title: 'В обработке', value: 'processing', disabled: false }
])
</script>

<template>
	<BottomSheet ref="bottomSheetRef" :actions="props.actions" @closed="emit('closed')">
		<template #title>Фильтр</template>
		<template #content>
			<div class="settings-content">
				<SelectButtons id="some-id" v-model="filterModel" :buttons="filters" />
				<Input id="date-input" v-model="dates" label="Период">
					<template #append>
						<CalendarIcon />
					</template>
				</Input>
				<div class="settings-sum">
					<Input id="sumFrom" v-model="sumFrom" label="Сумма от" />
					<Input id="sumTo" v-model="sumTo" label="Сумма до" />
				</div>
				<Button id="settings-reset" type="ghost">Сбросить</Button>
				<Button id="settings-apply">Применить</Button>
			</div>
		</template>
	</BottomSheet>
</template>

<style lang="scss">
.settings-content {
	padding: 0 var(--space-4) var(--space-4) var(--space-4);
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.settings-sum {
	display: flex;
	gap: var(--space-4);
}
</style>
