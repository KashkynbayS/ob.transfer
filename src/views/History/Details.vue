<script setup lang="ts">
import { Button, Cell, CellGroup, CellGroupHeader } from "@ui-kit/ui-kit";

import { DateTime } from "luxon";

import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import AppNavbar from "@/components/AppNavbar.vue";
import { useFormAutoFill } from "@/helpers/useFormAutoFill.ts";
import { useHistoryStore } from "@/stores/history.ts";
import { CURRENCY, FormParams, TransactionStatus } from "@/types";

import ArrowRoundIcon from "@/assets/icons/arrow-round.svg";
import ShareIcon from "@/assets/icons/share.svg";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { maskPhoneNumber } from "@/utils";

const { t } = useI18n();

const route = useRoute();
const historyStore = useHistoryStore();
const { routerPushWithData } = useFormAutoFill();

const transactionId = computed(() => route.params.id as string);
const details = computed(() => historyStore.getTransactionById(transactionId.value));

const statuses: Record<TransactionStatus, string> = {
	success: "HISTORY.STATUS.COMPLETED",
	in_progress: "HISTORY.STATUS.IN_PROCESSING",
	waiting: "HISTORY.STATUS.WAITING",
	credited: "HISTORY.STATUS.CREDITED",
	removed: "HISTORY.STATUS.REMOVED",
	rejected: "HISTORY.STATUS.REJECTED",
	denied: "HISTORY.STATUS.DENIED",
};

const formattedDateTime = computed(() => {
	if (!details.value) {
		return "";
	}

	const date = DateTime.fromISO(details.value.createdAt).setZone("Asia/Aqtau");
	return date.setLocale("ru").toFormat("d MMMM HH:mm");
});

const formattedAmount = computed(() => {
	return `-${useFormattedCurrency(details.value?.amount, CURRENCY.KZT).formattedCurrency.value}`
});

const groups = computed(() => {
	return [
		{
			title: t("HISTORY.DETAILS.WRITE_OFF_DETAILS"),
			rows: [
				{
					label: t("HISTORY.DETAILS.WRITE_OFF_ACCOUNT"),
					isRequired: true,
					value: details.value?.iban,
				},
				{
					label: t("HISTORY.DETAILS.KBE"),
					value: details.value?.kbe,
				},
				{
					label: t("HISTORY.DETAILS.KNP"),
					value: details.value?.knp,
				},
				{
					label: t("HISTORY.DETAILS.PURPOSE"),
					value: details.value?.transferDescription,
				},
				{
					label: t("HISTORY.DETAILS.COMMISSION"),
					isRequired: true,
					value: useFormattedCurrency(details.value?.commission || 0).formattedCurrency.value,
				},
			],
		},
		{
			title: t("HISTORY.DETAILS.RECEIVER"),
			rows: [
				{
					label: t("HISTORY.DETAILS.RECEIVER_ACCOUNT"),
					value: details.value?.recIban,
				},
				{
					label: t("HISTORY.DETAILS.RECEIVER_IIN"),
					value: details.value?.recIin,
				},
				{
					label: t("HISTORY.DETAILS.RECEIVER_PHONE"),
					value: details.value?.recMobileNumber
						? maskPhoneNumber(details.value.recMobileNumber)
						: "",
				},
				{
					label: t("HISTORY.DETAILS.RECEIVER_NAME"),
					value: details.value?.recFio,
				},
			],
		},
	]
})


function repeatAction() {
	const params: FormParams = {};

	if (details.value?.amount) params.amount = String(details.value.amount);
	if (details.value?.recMobileNumber)
		params.recMobileNumber = details.value.recMobileNumber;
	if (details.value?.recIban) params.recIban = details.value.recIban;
	if (details.value?.recIin) params.recIin = details.value.recIin;
	if (details.value?.recFio) params.recFio = details.value.recFio;
	if (details.value?.iban) params.iban = details.value.iban;
	if (details.value?.kbe) params.kbe = details.value.kbe;

	routerPushWithData("External", params);
}


onMounted(() => {
	historyStore.fetchHistory();
});
</script>

<template>
<div class="details">
	<AppNavbar>
		<template #title>
			<h5>{{ $t("HISTORY.DETAILS.TITLE") }}</h5>
		</template>
	</AppNavbar>

	<template v-if="details">
		<div class="details__value">{{ formattedAmount }}</div>
		<div class="details__info">
			<span class="details__status">{{ $t(statuses[details.status]) }}</span>
			<span class="details__date"> • {{ formattedDateTime }}</span>
		</div>

		<div class="details__actions">
			<Button :size="'sm'" id="share-details-btn">
				<ShareIcon style="width: auto; height: auto" />
				<span>{{ $t("HISTORY.DETAILS.SHARE") }}</span>
			</Button>
			<Button :size="'sm'" id="repeat-details-btn" type="secondary-gray" @click="repeatAction">
				<ArrowRoundIcon color="var(--text-low-contrast)" />
				<span class="text-low-contrast">{{ $t("HISTORY.DETAILS.REPEAT") }}</span>
			</Button>
		</div>

		<CellGroup type="island" v-for="group in groups" :key="group.title">
			<CellGroupHeader>
				<template #title>{{ group.title }}</template>
			</CellGroupHeader>

			<template v-for="row in group.rows" :key="row.label">
				<Cell v-if="!row.isRequired && row.value || row.isRequired">

					<template #subtitle>
						<span class="text-caption">
							{{ row.label }}
						</span>
					</template>

					<template #title>{{ row.value }}</template>
				</Cell>
			</template>
		</CellGroup>
	</template>
</div>
</template>

<style scoped lang="scss">
.details {
	&__value {
		display: flex;
		flex-direction: column;
		font-size: var(--font-size-heading-1);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-heading-1);
		padding: var(--space-4) var(--space-4) var(--space-1) var(--space-4);
	}

	&__info {
		padding: 0 var(--space-4);
		color: var(--text-low-contrast);
		margin-bottom: var(--space-6);
	}

	&__status {
		color: var(--text-high-contrast);
	}

	&__actions {
		display: flex;
		padding: 0 var(--space-4);
		gap: var(--space-4);
	}
}
</style>
