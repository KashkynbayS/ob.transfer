<script setup lang="ts">
import { ref, watch } from 'vue'

import { useRouter } from 'vue-router'

import { SegmentedControl } from '@ui-kit/ui-kit'

import AppNavbar from '@/components/AppNavbar.vue'

type SegnemtType = 'new' | 'frequent'
const segmentedControlValue = ref<SegnemtType>('new')

const router = useRouter()

watch(segmentedControlValue, () => {
	router.push({
		name: segmentedControlValue.value === 'new' ? 'New' : 'Frequent'
	})
})
</script>

<template>
	<AppNavbar>
		<template #title>
			<h5>{{ $t('TRANSFER.TITLE') }}</h5>
		</template>

		<template #label>
			<button class="history-link">{{ $t('TRANSFER.HISTORY') }}</button>
		</template>
	</AppNavbar>

	<div class="transfer-nav">
		<SegmentedControl
			v-model="segmentedControlValue"
			:options="[
				{
					id: 'new',
					value: 'new',
					label: $t('TRANSFER.TABS.NEW'),
					disabled: false
				},
				{
					id: 'frequent',
					value: 'frequent',
					label: $t('TRANSFER.TABS.FREQUENT'),
					disabled: false
				}
			]"
		/>
	</div>

	<router-view></router-view>
</template>
<style lang="scss" scoped>
.transfer-nav {
	box-sizing: content-box;
	height: 100%;
	padding: var(--space-3) var(--space-4);

	.segment-picker {
		width: 100%;
	}
}

.history-link {
	color: var(--txt-icons-red, var(--accent-primary));
}
</style>
