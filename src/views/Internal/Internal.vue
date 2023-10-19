<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import { SegmentedControl } from '@ui-kit/ui-kit'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
type SegnemtType = 'phone' | 'account'
const segmentedControlValue = ref<SegnemtType>('account')
const router = useRouter()

watch(segmentedControlValue, () => {
	router.push({
		name: segmentedControlValue.value === 'account' ? 'InternalAccount' : 'InternalPhone'
	})
})
</script>

<template>
	<AppNavbar>
		<template #title
			><h5>{{ $t('INTERNAL.TITLE') }}</h5></template
		>
	</AppNavbar>
	<div class="internal">
		<SegmentedControl
			v-model="segmentedControlValue"
			:options="[
				{
					id: 'phone',
					value: 'phone',
					label: $t('INTERNAL.TABS.PHONE'),
					disabled: false
				},
				{
					id: 'account',
					value: 'account',
					label: $t('INTERNAL.TABS.IBAN'),
					disabled: false
				}
			]"
		/>
	</div>

	<router-view></router-view>
</template>
<style lang="scss">
.internal {
	box-sizing: content-box;
	height: 100%;
	padding: var(--space-8) var(--space-4) 0 var(--space-4);

	.segment-picker {
		width: 100%;
		&__item {
			width: 50%;
		}
	}
}
</style>
