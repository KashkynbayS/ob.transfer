export function getRelativeUrl(url: string): string {
	// { "type": "link", "data": { "class": "", "title": "", "description": "", "showAs": "", "actions": null, "target": "_self", "url": "https://online-dev.kmf.kz/app/bank/transfer/otp" } }
	url = url.replace('https://online-dev.kmf.kz', '')
	const searchString = import.meta.env.BASE_URL
	const index = url.indexOf(searchString)

	return url.substring(index + searchString.length)
}
console.log(import.meta.env.BASE_URL)
