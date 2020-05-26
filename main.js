//========//
// Frames //
//========//
const SEQUENCE_LENGTH = 33
const IMAGE_WIDTH = 1920
const IMAGE_HEIGHT = 1080
const ASPECT_RATIO = IMAGE_HEIGHT / IMAGE_WIDTH

const frames = []
for (let i = 0; i < SEQUENCE_LENGTH; i++) {
	const src = `Media/BounceImageSequence/BounceSequence${i}.png`
	const img = new Image(IMAGE_HEIGHT, IMAGE_WIDTH)
	img.src = src
	frames.push(img)
}

//========//
// Canvas //
//========//
const canvas = document.createElement("canvas")
document.body.appendChild(canvas)

canvas.style.position = "fixed"
canvas.style.top = 0
canvas.style.left = 0
canvas.style["background-color"] = "black"

const resizeCanvas = () => {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	canvas.style.width = window.innerWidth + "px"
	canvas.style.height = window.innerHeight + "px"
}

resizeCanvas()
on.resize(resizeCanvas)

//======//
// Hands //
//======//
const hands = new Image()
hands.src = "Media/Hands.png"
hands.style.position = "fixed"
hands.style.right = 0
hands.style.width = "100%"

document.body.appendChild(hands)

const resizeHands = () => {
	hands.style.top = (canvas.width * ASPECT_RATIO * 0.5) + "px"
}

resizeHands()
on.resize(resizeHands)

//========//
// Stereo //
//========//
const stereo = new Image()
stereo.src = "Media/Stereo.png"
stereo.style.position = "fixed"
stereo.style.left = 0
stereo.style.bottom = 0
stereo.style.height = "30%"
document.body.appendChild(stereo)

stereo.on.click(e => {
	
})

//======//
// Drum //
//======//
const drum = new Image()
drum.src = "Media/Drum.png"
drum.style.position = "fixed"
drum.style.right = 0
drum.style.bottom = 0
drum.style.height = "30%"
document.body.appendChild(drum)

const average = (ns) => {
	const total = ns.reduce((a, b) => a + b, 0)
	return total / ns.length
}

let lastDrumTime = 0
const diffs = []
let drumDiff = average(diffs)

const DRUM_RESET_THRESHOLD = 1

drum.on.mousedown(e => {
	const diff = currTime - lastDrumTime
	lastDrumTime = currTime
	diffs.push(diff)
	if (diff > DRUM_RESET_THRESHOLD) {
		diffs.length = 0
	}
	currFrameNumber = 7
	diffStack = 0
	drumDiff = getDrumDiff(diffs) / SEQUENCE_LENGTH * 4
	
})

const getDrumDiff = (diffs) => {
	if (diffs.length == 0) return undefined
	if (diffs.length == 1) return diffs[0]
	const total = diffs.reduce((a, b) => a + b, 0)
	const interval = (total / diffs.length)
	const otherDiffs = [...diffs.slice(0, -1)]
	const otherInterval = getDrumDiff(otherDiffs)
	const averageInterval = average([interval, otherInterval])
	return interval
}

//=========//
// Display //
//=========//
const ctx = canvas.getContext("2d")

let lastTime = 0
let currTime = 0
let fps = 17
let currFrameNumber = 0

let diffStack = 0

const draw = (time) => {
	currTime = time / 1000
	
	const diff = currTime - lastTime
	lastTime = currTime
	diffStack += diff
	
	while (diffStack > drumDiff) {
		currFrameNumber = wrap(currFrameNumber + 1, SEQUENCE_LENGTH)
		diffStack -= drumDiff
	}
	
	
	ctx.drawImage(frames[currFrameNumber], 0, 0, canvas.width, canvas.width * ASPECT_RATIO)
	requestAnimationFrame(draw)
}

const wrap = (n, max) => n % max

requestAnimationFrame(draw)
