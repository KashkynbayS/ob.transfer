import { CURRENCY } from '@/types';
import { computed, ref } from 'vue';

export function useFormattedCurrency(initialValue = 0, currencyType = CURRENCY.KZT) {
	const currency = ref(initialValue)

	const formattedCurrency = computed(() => {
		const hasFraction = currency.value % 1 !== 0;

		const options = {
			style: 'currency',
			currency: currencyType,
			minimumFractionDigits: hasFraction ? 2 : 0,
			maximumFractionDigits: hasFraction ? 2 : 0,
		};

		const formatter = new Intl.NumberFormat('ru-KZ', options);

		return formatter.format(currency.value);
	});

	return {
		currency,
		formattedCurrency
	}
}
