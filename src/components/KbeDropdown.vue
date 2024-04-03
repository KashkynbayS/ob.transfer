<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { useKbeStore } from '@/stores/kbe'
import { Kbe } from '@/types/kbe'
import Search from '@ui-kit/kmf-icons/interface/searches/search-small.svg'
import { BottomSheet, Cell, CellGroup, Dropdown, Input } from '@ui-kit/ui-kit'

const kbeStore = useKbeStore()
const search = ref('')

const props = defineProps<{
	id: string
	modelValue: Kbe | null
	value?: Kbe | undefined | null
	errorInvalid: boolean
	helperText: string
	updateField: Function
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', val: Kbe): void
}>()

const selected = ref<Kbe | null>(props.modelValue || null)
const bottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)

const selectedView = computed(() => (selected.value ? `${selected.value?.code} - ${selected.value?.nameRu}` : ''))

const onSelect = (item: Kbe) => {
	selected.value = item
	emit('update:modelValue', item)
	bottomSheetRef.value?.close()
	props.updateField()
}

watchEffect(() => {
	kbeStore.searchKbe(search.value)
})
</script>

<template>
	<div class="kbe">
		<Dropdown :id="props.id" :value="selectedView" :label="$t('KBE.LABEL')" @click="bottomSheetRef?.open()"
			:invalid="props.errorInvalid" :helper-text="props.helperText" />

		<BottomSheet ref="bottomSheetRef">
			<template #title>
				<h4>{{ $t('KBE.TITLE') }}</h4>
			</template>
			<template #content>
				<section class="kbe__content">
					<Input id="kbe-dropdown-search" v-model="search" :label="$t('KBE.SEARCH')">
					<template #prepend>
						<Search />
					</template>
					</Input>
					<CellGroup v-if="kbeStore.list.length > 0">
						<Cell v-for="item in kbeStore.list" :key="item.code" @click="onSelect(item)">
							<template #title>{{ item.nameRu }}</template>
							<template #subtitle>{{ $t('KBE.LABEL') + ' ' + item.code }}</template>
						</Cell>
					</CellGroup>
					<p v-else class="empty">
						{{ $t('KBE.NOT_FOUND') }}
					</p>
				</section>
			</template>
		</BottomSheet>
	</div>
</template>

<style scoped>
.kbe {
	width: 100%;
}

.kbe__content {
	padding: 0 var(--space-4);
}

.empty {
	text-align: center;
	color: var(--grey-primary);
	padding: var(--space-4) 0;
}
</style>
