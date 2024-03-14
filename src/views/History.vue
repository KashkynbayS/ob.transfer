<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { CellGroup } from '@ui-kit/ui-kit'

import FiltersIcon from '@/assets/icons/filters.svg'

import AppNavbar from '@/components/AppNavbar.vue'
import AppTags from '@/components/AppTags.vue'
import HistoryItem from '@/components/HistoryItem.vue'
import HistorySettings from '@/components/HistorySettings.vue'

import { useHistoryStore } from '@/stores/history.ts'
import { HistoryGroup } from '@/types'


const router = useRouter()
const historyStore = useHistoryStore()

const history = computed<HistoryGroup[]>(() => historyStore.transformedHistory)

const openDetails = (id: string) => {
	router.push({
		name: 'Details',
		params: {
			id
		}
	})
}

const isSettingsShown = ref(false)

const onSettingsButtonClick = () => {
	isSettingsShown.value = true
}

const onSettingsClose = () => {
	isSettingsShown.value = false
}

const onSettingsApply = () => {
	onSettingsClose()
	historyStore.fetchHistory()
}

const onTagRemove = (filterValue: string) => {
	historyStore.disableFilter(filterValue)
}

onMounted(() => {
	historyStore.fetchHistory()
})
</script>

<template>
<div class="history">
	<AppNavbar>
		<template #title>
			<h5>{{ $t('HISTORY.TITLE') }}</h5>
		</template>

		<template #label>
			<button id="history-filters-btn" class="history__filters" @click="onSettingsButtonClick">
				<FiltersIcon />
			</button>
		</template>
	</AppNavbar>

	<AppTags class="history__tags" :tags="historyStore.filterTags" @removed="onTagRemove" />

	<CellGroup v-for="group in history" :key="group.title" class="transaction-group">
		<div class="transaction-group__title">
			{{ group.isTitleWithTranslation ? $t(group.title) : group.title }}
		</div>
		<HistoryItem :item="item" v-for="item in group.list" :key="item.id" @click="openDetails(item.id)" />
	</CellGroup>

	<div v-if="historyStore.errorMsg" class="history__error">{{ historyStore.errorMsg }}</div>

	<HistorySettings :show="isSettingsShown" @closed="onSettingsClose" @apply="onSettingsApply" />
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
