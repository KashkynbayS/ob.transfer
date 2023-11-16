<script setup lang="ts">
import { Button } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'
import { useSuccessStore } from '@/stores/success'
import { watch } from 'vue'

const successStore = useSuccessStore()

watch(
	() => successStore,
	(store) => {
		console.log(store)
	}
)
</script>

<template>
	<PageTemplate>
		<Button id="ownSubmit" type="ghost"> {{ $t('SUCCESS.DETAILS') }} </Button>
		<Button id="ownSubmit" type="primary"> {{ $t('SUCCESS.RETURN_TO_HOMEPAGE') }} </Button>
	</PageTemplate>
</template>

<style scoped></style>
