export function getRelativeUrl(url: string): string {
	const searchString = import.meta.env.BASE_URL
	const index = url.indexOf(searchString)

	return url.substring(index + searchString.length)
}
