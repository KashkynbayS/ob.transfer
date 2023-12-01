<script setup lang="ts">
import { BottomSheet, Input, Button, SelectButton, Calendar } from '@ui-kit/ui-kit'
import CalendarIcon from '@ui-kit/kmf-icons/others/calendars/calendar.svg'
import { reactive, ref, watch } from 'vue'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'
import { HistoryFilter } from '@/stores/details.ts'

const props = defineProps<{
	show: boolean
	actions?: ModalAction[]
}>()

const emit = defineEmits<{
	(e: 'closed'): void
	(e: 'apply', v: Filter[]): void
}>()

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
const showCalendar = ref(false)

function toggleCalendar(value = !showCalendar.value) {
	showCalendar.value = value
}

function applyDates() {
	dates.value = '1.07.23 – 14.08.23'
	toggleCalendar(false)
}

function applyFilters() {
	emit('closed')
}

interface Filter {
	id: HistoryFilter
	title: string
	value: HistoryFilter
	disabled: boolean
}

const filters = reactive<Filter[]>([
	{ id: 'all', title: 'Все', value: 'all', disabled: false },
	{ id: 'executed', title: 'Исполнено', value: 'executed', disabled: false },
	{ id: 'rejected', title: 'Отклонено', value: 'rejected', disabled: false },
	{ id: 'processing', title: 'В обработке', value: 'processing', disabled: false }
])

function closeHandler() {
	emit('closed')

	setTimeout(() => {
		toggleCalendar(false)
	}, 300)
}
</script>

<template>
	<BottomSheet ref="bottomSheetRef" :actions="props.actions" @closed="closeHandler">
		<template #title>Фильтр</template>
		<template #content>
			<div class="settings">
				<div v-if="showCalendar" class="settings__calendar">
					<Calendar v-model="dates" />
					<Button id="settings-apply" class="settings__apply-btn" @click="applyDates">Применить</Button>
				</div>

				<div v-else class="settings__main">
					<div class="settings__select-wrapper">
						<SelectButton
							v-for="filter in filters"
							:id="filter.id"
							:key="filter.id"
							v-model="filterModel"
							:value="filter.value"
							:title="filter.title"
						/>
					</div>
					<Input id="date-input" v-model="dates" label="Период" @on-focus="toggleCalendar(true)">
						<template #append>
							<CalendarIcon />
						</template>
					</Input>
					<div class="settings__sum">
						<Input id="sumFrom" v-model="sumFrom" label="Сумма от" />
						<Input id="sumTo" v-model="sumTo" label="Сумма до" />
					</div>
					<Button id="settings-reset" type="ghost">Сбросить</Button>
					<Button id="settings-apply" class="settings__apply-btn" @click="applyFilters">Применить</Button>
				</div>
			</div>
		</template>
	</BottomSheet>
</template>

<style lang="scss">
.settings {
	&__main {
		padding: 0 var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	&__calendar {
		display: flex;
		flex-direction: column;

		& button {
			margin: 0 var(--space-4);
		}
	}

	&__select-wrapper {
		display: flex;
		gap: var(--space-2);
		overflow-x: auto;
		--negative-space-4: calc(var(--space-4) * -1);
		transform: translateX(var(--negative-space-4));
		width: calc(100% + var(--space-8));
		padding: 0 var(--space-4);

		// Скрытие скроллбара
		-ms-overflow-style: none;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	&__sum {
		display: flex;
		gap: var(--space-4);
	}
}
</style>
