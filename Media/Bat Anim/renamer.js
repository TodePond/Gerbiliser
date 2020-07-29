
const SEQUENCE_LENGTH = 52

const getPaddedNumber = (n) => {
	let s = n.toString()
	while (s.length < 4) {
		s = "0" + s
	}
	console.log(s)
	return s
}

for (let i = 0; i < SEQUENCE_LENGTH; i++) {
	const oldSrc = `Bat Anim${getPaddedNumber(i)}.png`
	if (i % 2 != 0) {
		Deno.remove(oldSrc)
		continue
	}
	const newSrc = `Bat Anim${i / 2}.png`
	//console.log(oldSrc)
	await Deno.rename(oldSrc, newSrc)
}