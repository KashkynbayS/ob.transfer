<script setup lang="ts">
import { ref, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { SegmentedControl } from '@ui-kit/ui-kit'

import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()
const route = useRoute()

const page = ref(route.name === 'New' ? 'new' : 'frequent')

watch(page, () => {
	router.replace({
		name: page.value === 'new' ? 'New' : 'Frequent'
	})
})
</script>

<template>
	<div>
		<AppNavbar>
			<template #title>
				<h5>{{ $t('TRANSFER.TITLE') }}</h5>
			</template>

			<template #label>
				<router-link to="/history" class="history-link">{{ $t('TRANSFER.HISTORY') }}</router-link>
			</template>
		</AppNavbar>

		<div class="transfer-nav">
			<SegmentedControl
				v-model="page"
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
	</div>
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
