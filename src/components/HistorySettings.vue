<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import CalendarIcon from '@ui-kit/kmf-icons/others/calendars/calendar.svg'
import { BottomSheet, Button, Calendar, Input, SelectButton } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'

import { HistoryFilter, filters, useHistoryStore } from '@/stores/history.ts'

const props = defineProps<{
	show: boolean
	actions?: ModalAction[]
}>()

const emit = defineEmits<{
	(e: 'closed'): void
	(e: 'apply'): void
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
const historyStore = useHistoryStore()

const dates = computed<Date[]>({
	get() {
		return historyStore.settings.dates
	},
	set(newValue) {
		historyStore.settings.dates = newValue
	}
})
const datesString = computed(() => historyStore.datesString)
const filterModel = computed({
	get() {
		return historyStore.settings.currentFilter as string
	},
	set(newValue) {
		historyStore.settings.currentFilter = newValue as HistoryFilter
	}
})

const sumFrom = computed<string>({
	get() {
		return historyStore.settings.sum.from
	},
	set(newValue) {
		historyStore.settings.sum.from = newValue
	}
})

const sumTo = computed<string>({
	get() {
		return historyStore.settings.sum.to
	},
	set(newValue) {
		historyStore.settings.sum.to = newValue
	}
})

const showCalendar = ref(false)

function toggleCalendar(value = !showCalendar.value) {
	showCalendar.value = value
}

function applyFilters() {
	emit('apply')
}

function closeHandler() {
	emit('closed')

	setTimeout(() => {
		toggleCalendar(false)
	}, 300)
}

function onDateSelected(value: Date[]) {
	dates.value = value

	toggleCalendar(false)
}
</script>

<template>
	<BottomSheet ref="bottomSheetRef" :actions="props.actions" @closed="closeHandler">
		<template #title>{{ $t("HISTORY.FILTER.TITLE") }}</template>

		<template #content>
			<div class="settings">
				<div v-if="showCalendar" class="settings__calendar">
					<Calendar v-model="dates" @on-date-selected="onDateSelected">
						<template #calendar-title>{{ $t("HISTORY.FILTER.APPLY") }}</template>
					</Calendar>
				</div>

				<div v-else class="settings__main">
					<div class="settings__select-wrapper">
						<SelectButton v-for="filter in filters" :id="filter.id" :key="filter.id" v-model="filterModel"
							:value="filter.value" :title="$t(filter.title)" />
					</div>
					<Input id="date-input" :model-value="datesString" :label="$t('HISTORY.FILTER.PERIOD.LABEL')"
						@on-focus="toggleCalendar(true)">

					<template #append>
						<CalendarIcon />
					</template>
					</Input>
					<div class="settings__sum">
						<Input id="sumFrom" v-model="sumFrom" :label="$t('HISTORY.FILTER.AMOUNT_FROM')" />
						<Input id="sumTo" v-model="sumTo" :label="$t('HISTORY.FILTER.AMOUNT_TO')" />
					</div>
					<Button id="settings-reset" type="ghost">{{ $t("HISTORY.FILTER.RESET") }}</Button>
					<Button id="settings-apply" class="settings__apply-btn" @click="applyFilters">
						{{ $t("HISTORY.FILTER.APPLY") }}
					</Button>
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
