import { InternalAxiosRequestConfig } from "axios"
import { jwtDecode } from "jwt-decode"

import { tokenExpired } from "@ui-kit/events"

import { useAlertsStore } from "@/stores/alerts"
import { AlertType } from "@/types/alert"

const EXPIRED_ALERT: AlertType = {
    show: true,
    title: 'Внимание',
    description: 'Ваша сессия истекла. Пожалуйста, авторизуйтесь снова',
    actions: [
        {
            mode: 'primary',
            title: 'Авторизоваться',
            autoClose: false,
            disabled: false,
            action: () => tokenExpired()
        }
    ]
}

export const requestTokenExpiredInterceptor = (
    config: InternalAxiosRequestConfig<any>
) => {
    if (!config || !config.headers.Authorization) return config

    const abortController = new AbortController()
    const alertStore = useAlertsStore()
    const decoded = jwtDecode(sessionStorage.accessToken) as any

    if (Date.now() > decoded.exp * 1000) {
        config.signal = abortController.signal
        abortController.abort()
        alertStore.showErrorAlert(EXPIRED_ALERT)
    }

    return config
}