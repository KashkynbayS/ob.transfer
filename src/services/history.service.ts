export const HistoryService = {
	fetch(): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve()
			}, 1000)
		})
	}
}
