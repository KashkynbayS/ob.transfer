<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { HttpLogger, LoaderPage } from '@ui-kit/ui-kit';

import TargetBlankModal from '@/components/TargetBlankModal.vue';

import { useAlertsStore } from '@/stores/alerts.ts';
import { useLoadingStore } from '@/stores/loading.ts';

import { isDebug } from '@/utils';


const loadingStore = useLoadingStore()
const alertsStore = useAlertsStore()

const { errorAlert } = storeToRefs(alertsStore)

</script>

<template>
<main>
	<router-view v-slot="{ Component }">
		<transition name="slide-fade" mode="out-in">
			<component :is="Component" />
		</transition>
	</router-view>

	<transition name="fade" mode="out-in">
		<LoaderPage v-if="loadingStore.isLoading" />
	</transition>

	<transition name="fade" mode="out-in">
		<http-logger v-if="isDebug"></http-logger>
	</transition>

	<modal ref="errorModalRef" :actions="errorAlert.actions">
		<template #title>{{ errorAlert.title }}</template>
		<template #body>{{ errorAlert.description }}</template>
	</modal>

	<TargetBlankModal />
</main>
</template>
