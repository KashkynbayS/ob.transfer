<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';

import { Modal } from '@ui-kit/ui-kit';
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types';

import { useLeaveConfirmedStore } from '@/stores/guard';

const leaveConfirmedStore = useLeaveConfirmedStore();

const props = defineProps<{
    form: {},
}>()

// Modal
const modal = ref<InstanceType<typeof Modal> | null>(null)
const router = useRouter()
let destPath = ''
leaveConfirmedStore.setIsLeaveConfirmed(false);

const actions = reactive<ModalAction[]>([
    {
        mode: 'primary',
        title: 'Перейти',
        autoClose: true,
        action: () => {
            leaveConfirmedStore.setIsLeaveConfirmed(true);
            router.push(destPath)
        }
    },
    {
        mode: 'ghost',
        title: 'Остаться',
        autoClose: true,
    }
])

// Guard
onBeforeRouteLeave((to, _, next) => {
    const { form } = props;
    const isFormDirty = Object.values(form).some(value => value !== undefined && value !== null && value !== '');
    destPath = to.fullPath

    if (!isFormDirty || leaveConfirmedStore.$state.isLeaveConfirmed) {
        next(true)
    }
    else modal.value?.open()
})

</script>

<template>
    <Modal ref="modal" v-bind="{ asd: 'asdasd' }" :actions="actions" close-on-outline-click>
        <template #title>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.TITLE') }}</template>
        <template #body>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.SUBTITLE') }}</template>
    </Modal>
</template>