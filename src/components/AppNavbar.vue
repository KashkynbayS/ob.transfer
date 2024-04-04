<script setup lang="ts">
import { closeWindow } from '@ui-kit/events';
import ArrowLeft from '@ui-kit/kmf-icons/arrows/large/arrowLeft.svg';
import { Navbar } from '@ui-kit/ui-kit';
import { useSlots } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter()
const route = useRoute()


const goBack = () => {
	if (route.name === 'New') {
		closeWindow()
	} else {
		router.push('/new')
	}
}

const slots = useSlots()
</script>

<template>
	<Navbar platform="ios" class="navbar" @on-left-btn-click="goBack">
		<template #left>
			<ArrowLeft class="navbar__back-arrow history-link" />
		</template>
		<template v-if="slots.title" #title>
			<slot name="title" />
		</template>
		<template v-if="slots.label" #label>
			<slot name="label" />
		</template>
	</Navbar>
</template>

<style scoped lang="scss">
.navbar {
	&__back-arrow {
		color: var(--grey-primary);
	}
}
</style>
