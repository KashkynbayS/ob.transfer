<script setup lang="ts">
import { computed } from 'vue';

import ALMNKZKA from '@/assets/banks/ALMNKZKA.svg';
import ATYNKZKA from '@/assets/banks/ATYNKZKA.svg';
import BKCHKZKA from '@/assets/banks/BKCHKZKA.svg';
import BRKEKZKA from '@/assets/banks/BRKEKZKA.svg';
import CASPKZKA from '@/assets/banks/CASPKZKA.svg';
import CEDUKZKA from '@/assets/banks/CEDUKZKA.svg';
import CITIKZKA from '@/assets/banks/CITIKZKA.svg';
import DVKAKZKA from '@/assets/banks/DVKAKZKA.svg';
import EABRKZKA from '@/assets/banks/EABRKZKA.svg';
import EURIKZKA from '@/assets/banks/EURIKZKA.svg';
import GCVPKZ2A from '@/assets/banks/GCVPKZ2A.svg';
import HCSKKZKA from '@/assets/banks/HCSKKZKA.svg';
import HLALKZKZ from '@/assets/banks/HLALKZKZ.svg';
import HSBKKZKX from '@/assets/banks/HSBKKZKX.svg';
import ICBKKZKX from '@/assets/banks/ICBKKZKX.svg';
import INEARUMM from '@/assets/banks/INEARUMM.svg';
import INLMKZKA from '@/assets/banks/INLMKZKA.svg';
import IRTYKZKA from '@/assets/banks/IRTYKZKA.svg';
import KCJBKZKX from '@/assets/banks/KCJBKZKX.svg';
import KICEKZKX from '@/assets/banks/KICEKZKX.svg';
import KINCKZKA from '@/assets/banks/KINCKZKA.svg';
import KISCKZKX from '@/assets/banks/KISCKZKX.svg';
import KKMFKZ2A from '@/assets/banks/KKMFKZ2A.svg';
import KPSTKZKA from '@/assets/banks/KPSTKZKA.svg';
import KSNVKZKA from '@/assets/banks/KSNVKZKA.svg';
import KZIBKZKA from '@/assets/banks/KZIBKZKA.svg';
import LARIKZKA from '@/assets/banks/LARIKZKA.svg';
import NBPAKZKA from '@/assets/banks/NBPAKZKA.svg';
import NBPFKZKX from '@/assets/banks/NBPFKZKX.svg';
import NBRKKZKX from '@/assets/banks/NBRKKZKX.svg';
import NURSKZKX from '@/assets/banks/NURSKZKX.svg';
import SHBKKZKA from '@/assets/banks/SHBKKZKA.svg';
import TBKBKZKA from '@/assets/banks/TBKBKZKA.svg';
import TNGRKZKX from '@/assets/banks/TNGRKZKX.svg';
import TSESKZKA from '@/assets/banks/TSESKZKA.svg';
import VTBAKZKZ from '@/assets/banks/VTBAKZKZ.svg';
import ZAJSKZ22 from '@/assets/banks/ZAJSKZ22.svg';

// Определение props
const props = defineProps({
    iban: {
        type: String,
        required: true
    }
});
interface BankIcons {
    [key: string]: string;
}

const BANK_ICONS: BankIcons = {
    '826': ALMNKZKA,
    '949': ATYNKZKA,
    '913': BKCHKZKA,
    '722': CASPKZKA,
    '766': CEDUKZKA,
    '832': CITIKZKA,
    '620': TNGRKZKX,
    '907': DVKAKZKA,
    '700': EABRKZKA,
    '948': EURIKZKA,
    '009': GCVPKZ2A,
    '972': HCSKKZKA,
    '246': HLALKZKZ,
    '601': HSBKKZKX,
    '930': ICBKKZKX,
    '550': INEARUMM,
    '886': INLMKZKA,
    '965': IRTYKZKA,
    '856': KCJBKZKX,
    '927': KICEKZKX,
    '821': KINCKZKA,
    '224': KISCKZKX,
    '070': KKMFKZ2A,
    '563': KPSTKZKA,
    '551': KSNVKZKA,
    '885': KZIBKZKA,
    '774': LARIKZKA,
    '553': NBPAKZKA,
    '147': NBPFKZKX,
    '125': NBRKKZKX,
    '849': NURSKZKX,
    '914': BRKEKZKA,
    '435': SHBKKZKA,
    '781': TBKBKZKA,
    '998': TSESKZKA,
    '432': VTBAKZKZ,
    '896': ZAJSKZ22,
};

const bankCode = computed(() => props.iban.substring(4, 7));
console.log(bankCode.value)
const iconComponent = computed(() => BANK_ICONS[bankCode.value]);

</script>

<template>
    <component :is="iconComponent" v-if="iconComponent" />
</template>