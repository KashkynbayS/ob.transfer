import { createI18n } from 'vue-i18n'

import { I18N as I18N_EN } from './en'
import { I18N as I18N_KK } from './kk'
import { I18N as I18N_RU } from './ru'

export const I18N_MESSAGES = {
	en: I18N_EN,
	kk: I18N_KK,
	ru: I18N_RU
}

const I18N_DEFAULT_LANG = 'ru'
const I18N_FALLBACK_LANG = 'en'

export const i18nPlugin = createI18n({
	locale: I18N_DEFAULT_LANG,
	messages: I18N_MESSAGES,
	fallbackLocale: I18N_FALLBACK_LANG
})
