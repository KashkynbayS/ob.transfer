<script setup lang="ts">
import PageTemplate from '@/layouts/PageTemplate.vue'
import { Button } from '@ui-kit/ui-kit'
</script>

<template>
	<PageTemplate>
		<Button id="ownSubmit" type="ghost"> {{ $t('SUCCESS.DETAILS') }} </Button>
		<Button id="ownSubmit" type="primary"> {{ $t('SUCCESS.RETURN_TO_HOMEPAGE') }} </Button>
	</PageTemplate>
</template>

<style scoped></style>
