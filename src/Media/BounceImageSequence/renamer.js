
const SEQUENCE_LENGTH = 66

for (let i = 0; i < SEQUENCE_LENGTH; i++) {
	if (i % 2 != 0) continue
	const oldSrc = `BounceSequence${i}.png`
	const newSrc = `BounceSequence${i / 2}.png`
	//console.log(oldSrc)
	await Deno.rename(oldSrc, newSrc)
}
