<script setup lang="ts">
import ArrowLeft from '@ui-kit/kmf-icons/arrows/large/arrowLeft.svg'
import { Navbar } from '@ui-kit/ui-kit'
import { useRouter } from 'vue-router'
import { useSlots } from 'vue'

const router = useRouter()

const goBack = () => {
	router.back()
}

const slots = useSlots()
</script>

<template>
	<Navbar platform="ios" class="navbar" @on-left-btn-click="goBack">
		<template #left>
			<ArrowLeft class="navbar__back-arrow" />
		</template>
		<template v-if="slots.title" #title> <slot name="title" /> </template>
		<template v-if="slots.right" #label> <slot name="right" /> </template>
	</Navbar>
</template>

<style scoped lang="scss">
.navbar {
	&__back-arrow {
		color: var(--grey-primary);
	}
}
</style>
