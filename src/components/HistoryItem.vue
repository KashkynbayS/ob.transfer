<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import KmfSemifilledIcon from '@ui-kit/kmf-icons/logos/kmf-semifilled.svg'
import { Cell } from '@ui-kit/ui-kit'

import ArrowRoundIcon from '@/assets/icons/arrow-round.svg'
import DepositIcon from '@/assets/icons/deposit.svg'

import BankIcon from '@/components/BankIcon.vue'
import TransactionValue from '@/components/TransactionValue.vue'

import { CURRENCY_SYMBOL } from '@/constants'
import { CURRENCY, HistoryItem } from '@/types'
import { TypeOfTransfer } from '@/types/transfer.ts'
import { maskIban, maskPhoneNumber } from '@/utils'

defineProps<{
    item: HistoryItem
}>()

const { t } = useI18n();

const mapDescription = (transaction: HistoryItem) => {
    switch (transaction.typeOfTransfer) {
        case TypeOfTransfer.Conversion:
            return 'HISTORY.TRANSACTION_DESCRIPTION.CONVERSION'
        case TypeOfTransfer.DepositReplenishment:
            return 'HISTORY.TRANSACTION_DESCRIPTION.REPLENISHMENT'
        case TypeOfTransfer.DepositWithdrawal:
            return 'HISTORY.TRANSACTION_DESCRIPTION.WITHDRAWAL'
        case TypeOfTransfer.InternalPhone:
        case TypeOfTransfer.InternalIban:
            return 'HISTORY.TRANSACTION_DESCRIPTION.INTERNAL'
        case TypeOfTransfer.External:
            return 'HISTORY.TRANSACTION_DESCRIPTION.EXTERNAL'
        default:
            return 'HISTORY.TRANSACTION_DESCRIPTION.UNKNOWN'
    }
}

const mapInternalTitle = (transaction: HistoryItem) => {
    if (transaction.recFio) {
        return transaction.recFio
    }
    if (transaction.recMobileNumber) {
        return t('HISTORY.TRANSACTION_TITLE.PHONE', { phone: maskPhoneNumber(transaction.recMobileNumber) })
    }
    return t('HISTORY.TRANSACTION_TITLE.UNKNOWN', { currency: CURRENCY.KZT.toUpperCase() })
}

const mapTitle = (transaction: HistoryItem) => {
    switch (transaction.typeOfTransfer) {
        case TypeOfTransfer.Conversion:
            return t('HISTORY.TRANSACTION_TITLE.CONVERSION', { currency: CURRENCY.KZT.toUpperCase() })
        case TypeOfTransfer.DepositReplenishment:
            return t('HISTORY.TRANSACTION_TITLE.REPLENISHMENT', { deposit: `*${transaction.recIban?.slice(-4)}` })
        case TypeOfTransfer.DepositWithdrawal:
            return t('HISTORY.TRANSACTION_TITLE.WITHDRAWAL', { currency: CURRENCY.KZT.toUpperCase() })
        case TypeOfTransfer.InternalPhone:
        case TypeOfTransfer.InternalIban:
            return mapInternalTitle(transaction)
        case TypeOfTransfer.External:
            return t('HISTORY.TRANSACTION_TITLE.EXTERNAL', { iban: transaction.recIban ? maskIban(transaction.recIban) : '' })
        default:
            return t('HISTORY.TRANSACTION_TITLE.UNKNOWN', { currency: CURRENCY.KZT.toUpperCase() })
    }
}

const mapIcon = (transaction: HistoryItem) => {
    switch (transaction.typeOfTransfer) {
        case TypeOfTransfer.Conversion:
            return ArrowRoundIcon;
        case TypeOfTransfer.DepositReplenishment:
        case TypeOfTransfer.DepositWithdrawal:
            return DepositIcon;
        case TypeOfTransfer.External:
            return BankIcon;
        case TypeOfTransfer.InternalPhone:
        case TypeOfTransfer.InternalIban:
            return KmfSemifilledIcon;
        default:
            return ArrowRoundIcon;
    }
}

</script>
<template>
    <Cell reverse left-color="var(--text-low-contrast)" left-type="icon" left-bg="var(--bg-dark)">
        <template #left>
            <Component :is="mapIcon(item)" :iban="item.recIban" />
        </template>
        <template #title>{{ mapTitle(item) }}</template>
        <template #subtitle><span class="text-caption">{{ $t(mapDescription(item)) }}</span></template>

        <template #right>
            <div class="history__value">
                <TransactionValue :transaction="item" />
                <span v-if="item.commission" class="history__commission">
                    -{{ item.commission }}
                    {{ CURRENCY_SYMBOL[CURRENCY.KZT] }}
                </span>
            </div>
        </template>
    </Cell>
</template>