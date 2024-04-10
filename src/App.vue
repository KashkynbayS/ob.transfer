<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { HttpLogger, LoaderPage, Modal } from '@ui-kit/ui-kit';

import TargetBlankModal from '@/components/TargetBlankModal.vue';

import { useAlertsStore } from '@/stores/alerts.ts';
import { useLoadingStore } from '@/stores/loading.ts';

import { isDebug } from '@/utils';
import { ref, watch } from 'vue';

const loadingStore = useLoadingStore()
const alertsStore = useAlertsStore()

const { errorAlert } = storeToRefs(alertsStore)
const errorModalRef = ref<InstanceType<typeof Modal> | null>()

watch(
	() => errorAlert.value.show,
	(val) => {
		if (val) {
			errorModalRef.value?.open()
		} else {
			errorModalRef.value?.close()
		}
	}
)

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

	<Modal ref="errorModalRef" :actions="errorAlert.actions">
		<template #title>{{ errorAlert.title }}</template>
		<template #body>{{ errorAlert.description }}</template>
	</Modal>

	<TargetBlankModal />
</main>
</template>
