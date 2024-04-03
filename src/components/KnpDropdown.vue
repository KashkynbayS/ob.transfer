<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { useKnpStore } from '@/stores/knp'
import { Knp } from '@/types/knp'
import Search from '@ui-kit/kmf-icons/interface/searches/search-small.svg'
import { BottomSheet, Cell, CellGroup, Dropdown, Input } from '@ui-kit/ui-kit'

const knpStore = useKnpStore()
const search = ref('')

const props = defineProps<{
	id: string
	modelValue: Knp | null
	value?: Knp | undefined | null
	errorInvalid: boolean
	helperText: string
	updateField: Function
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', val: Knp): void
}>()

const selected = ref<Knp | null>(props.modelValue || null)
const bottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)

const selectedView = computed(() => (selected.value ? `${selected.value?.code} - ${selected.value?.nameRu}` : ''))

const onSelect = (item: Knp) => {
	selected.value = item
	emit('update:modelValue', item)
	bottomSheetRef.value?.close()
	props.updateField()
}

watchEffect(() => {
	knpStore.searchKnp(search.value)
})
</script>

<template>
	<div class="knp">
		<Dropdown :id="props.id" :value="selectedView" :label="$t('KNP.LABEL')" @click="bottomSheetRef?.open()"
			:invalid="props.errorInvalid" :helper-text="props.helperText" />

		<BottomSheet ref="bottomSheetRef">
			<template #title>
				<h4>{{ $t('KNP.TITLE') }}</h4>
			</template>
			<template #content>
				<section class="knp__content">
					<Input id="knp-dropdown-search" v-model="search" :label="$t('KNP.SEARCH')">
					<template #prepend>
						<Search />
					</template>
					</Input>
					<CellGroup v-if="knpStore.list.length > 0">
						<Cell v-for="item in knpStore.list" :key="item.code" @click="onSelect(item)">
							<template #title>{{ item.nameRu }}</template>
							<template #subtitle>{{ $t('KNP.LABEL') + ' ' + item.code }}</template>
						</Cell>
					</CellGroup>
					<p v-else class="empty">
						{{ $t('KNP.NOT_FOUND') }}
					</p>
				</section>
			</template>
		</BottomSheet>
	</div>
</template>

<style scoped>
.knp {
	width: 100%;
}

.knp__content {
	padding: 0 var(--space-4);
}

.empty {
	text-align: center;
	color: var(--grey-primary);
	padding: var(--space-4) 0;
}
</style>
