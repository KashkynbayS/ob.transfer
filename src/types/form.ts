export enum FORM_STATE {
	INITIAL = 'initial',
	LOADING = 'loading',
	SUCCESS = 'success',
	ERROR = 'error'
}

export interface FormStore {
	errors: Record<string, string>
	state: FORM_STATE
}
