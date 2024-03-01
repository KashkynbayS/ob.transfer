<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue';
import { SegmentedControl } from '@ui-kit/ui-kit';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter()
const route = useRoute()
const page = ref(route.name === 'InternalPhone' ? 'phone' : 'account')

watch(page, () => {
	router.replace({
		name: page.value === 'phone' ? 'InternalPhone' : 'InternalIban'
	})
})
</script>

<template>
	<div>
		<AppNavbar>
			<template #title>
				<h5>{{ $t('INTERNAL.TITLE') }}</h5>
			</template>
		</AppNavbar>
		<div class="internal">
			<SegmentedControl v-model="page" :options="[
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
			]" />
		</div>

		<router-view></router-view>
	</div>
</template>
<style lang="scss">
.internal {
	box-sizing: content-box;
	height: 100%;
	padding: var(--space-4) var(--space-4) 0 var(--space-4);

	.segment-picker {
		width: 100%;
	}
}
</style>
