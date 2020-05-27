export function $$(...args) {
	return document.querySelectorAll(...args)
}

export function $(...args) {
	return document.querySelector(...args)
}

export function HTML(...args) {
	const html = String.raw(...args).trim()
	const template = document.createElement("template")
	template.innerHTML = html
	const nodeList = template.content.childNodes
	if (nodeList.length === 1) return nodeList[0]
	return template
}