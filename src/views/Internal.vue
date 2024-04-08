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
	<div class="internal-block">
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
<style scoped lang="scss">
.internal-block {
	display: flex;
	flex-direction: column;
	height: 100dvh;
}

.internal {
	box-sizing: content-box;
	padding: var(--space-4) var(--space-4) 0 var(--space-4);

}

.internal-form {
	overflow-y: auto;
	overflow-x: hidden;
	width: 100%;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 var(--space-4) 0 var(--space-4);
}
</style>
