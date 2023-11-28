<template>
	<div class="links-list">
		<router-link class="button button--primary" to="/own">Между своими счетами</router-link>
		<router-link class="button button--primary" to="/history">История платежей</router-link>
	</div>
</template>
<script setup lang="ts"></script>
<style scoped>
.links-list {
	display: grid;
	gap: 16px;
	padding: 16px;
}
</style>
