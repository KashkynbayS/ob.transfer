<script setup lang="ts">
import { Button } from '@ui-kit/ui-kit'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Error from '@/assets/images/error.png'
import Info from '@/assets/images/info.png'
import Success from '@/assets/images/success.png'

import StatusPageLayout from '@/layouts/StatusPageLayout.vue'

import { useLeaveConfirmedStore } from '@/stores/guard'
import { useStatusStore } from '@/stores/status.ts'
import { useTransferDetailsStore } from '@/stores/transferDetails'

import { SseResponseStatusAction } from '@/types'

const router = useRouter()

const statusStore = useStatusStore()
const transferDetailsStore = useTransferDetailsStore()
const leaveConfirmedStore = useLeaveConfirmedStore();

leaveConfirmedStore.setIsLeaveConfirmed(false);

function handleClick(action: SseResponseStatusAction) {
	window.location.href = action.url
}

const image = computed(() => {
	switch (statusStore.class) {
		case 'success':
			return Success
		case 'error':
			return Error
		default:
			return Info
	}
})

onMounted(() => {
	if (statusStore.actions.length === 0) {
		router.replace('/')
	}
})
</script>

<template>
	<StatusPageLayout :image="image" :title="statusStore.title" title-width="80%" :text="statusStore.description">
		<template #footer>
			<Button v-for="action in statusStore.actions" id="status-action" :key="action.url"
				:type="action.type === 'secondary' ? 'ghost' : 'primary'"
				@click="action.title === 'Посмотреть детали' ? transferDetailsStore.openBottomSheet() : handleClick(action)">
				{{ action.title }}
			</Button>
		</template>
	</StatusPageLayout>
</template>
