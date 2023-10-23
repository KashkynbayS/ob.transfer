<script setup lang="ts">
import { reactive } from 'vue'

import { Button, Input } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AppNavbar from '@/components/AppNavbar.vue'
import AccountDropdown from '@/components/AccountDropdown.vue'

import { ACCOUNTS_GROUPS } from '@/mocks/own'

const form = reactive({
	from: null,
	to: null,
	amount: ''
})
</script>

<template>
	<PageTemplate>
		<AppNavbar>
			<template #title>
				<h5>{{ $t('OWN.TITLE') }}</h5>
			</template>
		</AppNavbar>

		<form class="form">
			<AccountDropdown
				v-model="form.from"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.FROM')"
				:disabled="form.to"
			/>
			<AccountDropdown
				v-model="form.to"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.TO')"
				:disabled="form.from"
			/>

			<Input v-model="form.writeOffAmount" :label="$t('OWN.FORM.WRITE_OFF_AMOUNT')" />
			<Input v-model="form.enrollmentAmount" :label="$t('OWN.FORM.ENROLLMENT_AMOUNT')" />

			<Button type="primary"> {{ $t('OWN.FORM.SUBMIT') }} </Button>
		</form>
		{{ form }}
	</PageTemplate>
</template>

<style scoped>
.form {
	width: 100%;
	display: grid;
	gap: var(--space-3);
}
</style>
