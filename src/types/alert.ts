import { ModalAction } from '@ui-kit/ui-kit'

export interface AlertStoreState {
    errorAlert: AlertType
}

export interface AlertType {
    show: boolean
    title: string
    description: string
    actions: ModalAction[]
}
