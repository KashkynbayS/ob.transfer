<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue';
import { SegmentedControl } from '@ui-kit/ui-kit';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
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
		<template #title
			><h5>{{ $t('TRANSFER.TITLE') }}</h5>
		</template>
		
		<template #label><button class="history" @click="">{{ $t('TRANSFER.HISTORY') }}</button></template>
	</AppNavbar>
	
	<div class="transfer">
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
<style lang="scss">
.transfer {
	box-sizing: content-box;
	height: 100%;
	padding: var(--space-8) var(--space-4) 0 var(--space-4);
 
	.segment-picker {
		width: 100%;
	}
}

.navbar__label {
	padding: 10px var(--space-4);
}

.history {
	color: var(--txt-icons-red, #ED1307);
}
</style>
