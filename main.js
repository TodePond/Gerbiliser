//========//
// Frames //
//========//
const SEQUENCE_LENGTH = 33
const IMAGE_WIDTH = 1920
const IMAGE_HEIGHT = 1080
const ASPECT_RATIO = IMAGE_HEIGHT / IMAGE_WIDTH

const frames = []
for (let i = 0; i < SEQUENCE_LENGTH; i++) {
	const src = `./Media/BounceImageSequence/BounceSequence${i}.png`
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

let imageDrawWidth = IMAGE_WIDTH
let imageDrawHeight = IMAGE_HEIGHT
let imageDrawX = 0

const resizeCanvas = () => {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	canvas.style.width = window.innerWidth + "px"
	canvas.style.height = window.innerHeight + "px"
	
	const widthRatio = canvas.width / IMAGE_WIDTH 
	const heightRatio = canvas.height / IMAGE_HEIGHT
	
	if (widthRatio > heightRatio) {
		imageDrawWidth = canvas.width
		imageDrawHeight = canvas.width * ASPECT_RATIO
	} else {
		imageDrawHeight = canvas.height
		imageDrawWidth = canvas.height / ASPECT_RATIO
	}
	
	imageDrawX = canvas.width/2 - imageDrawWidth/2
	imageDrawY = canvas.height/2 - imageDrawHeight/2
}

resizeCanvas()
window.addEventListener("resize", resizeCanvas)

//======//
// Hands //
//======//
/*const hands = new Image()
hands.src = "./Media/Hands.png"
hands.style.position = "fixed"
hands.style.right = 0
hands.style.width = "100%"

document.body.appendChild(hands)

const resizeHands = () => {
	hands.style.top = (canvas.width * ASPECT_RATIO * 0.5) + "px"
}

resizeHands()
window.addEventListener("resize", resizeHands)*/

//========//
// Stereo //
//========//
const stereo = new Image()
stereo.src = "./Media/Stereo.png"
stereo.style.position = "fixed"
stereo.style.left = 0
stereo.style.bottom = 0
stereo.style.height = "30%"
document.body.appendChild(stereo)

/*const player = HTML `<audio id="player" controls></audio>`
player.style.position = "fixed"
//document.body.appendChild(player)*/

let stereoInit = false
let stereoDiff = NaN

const bd = new BeatDetektor(85, 169, {
	BD_DETECTION_RANGES : 256,  // How many ranges to quantize the FFT into
	BD_DETECTION_RATE : 12.0,   // Rate in 1.0 / BD_DETECTION_RATE seconds
	BD_DETECTION_FACTOR : 0.915, // Trigger ratio
	BD_QUALITY_DECAY : 0.6,     // range and contest decay
	BD_QUALITY_TOLERANCE : 0.98,// Use the top x % of contest results
	BD_QUALITY_REWARD : 10.0,    // Award weight
	BD_QUALITY_STEP : 0.1,     // Award step (roaming speed)
	BD_MINIMUM_CONTRIBUTIONS : 6,   // At least x ranges must agree to process a result
	BD_FINISH_LINE : 60.0,          // Contest values wil be normalized to this finish line
	// this is the 'funnel' that pulls ranges in / out of alignment based on trigger detection
	BD_REWARD_TOLERANCES : [ 0.001, 0.005, 0.01, 0.02, 0.04, 0.08, 0.10, 0.15, 0.30 ],  // .1%, .5%, 1%, 2%, 4%, 8%, 10%, 15%
	BD_REWARD_MULTIPLIERS : [ 20.0, 10.0, 8.0, 1.0, 1.0/2.0, 1.0/4.0, 1.0/8.0, 1/16.0, 1/32.0 ]
})
	
stereo.addEventListener("click", async e => {
	tempoMode = "stereo"
	stereoDiff = NaN
	
	if (stereoInit) return
	stereoInit = true
	stereo.src = "./Media/StereoHit.png"
	
	// 1. Create audio context
	const context = new AudioContext({latencyHint: "playback"})
	
	// 2. Inside the context, create sources — such as <audio>, oscillator, stream
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: {
			autoGainControl: false,
			channelCount: 2,
			echoCancellation: false,
			noiseSuppression: false,
		}
	})
	
	const source = context.createMediaStreamSource(stream)
	
	// 3. Create effects nodes, such as reverb, biquad filter, panner, compressor
	//    eg: bpm detector
	const analyser = context.createAnalyser()
	const bufferLength = analyser.frequencyBinCount
	const buffer = new Float32Array(bufferLength)
	const analyse = (time) => {
		const seconds = time / 1000
		analyser.getFloatTimeDomainData(buffer)
		bd.process(seconds, buffer)
		const bpm = 60 / bd.winning_bpm
		print(`BPM: ${bpm}`)
		if (bpm !== Infinity) stereoDiff = (60 / bpm) / SEQUENCE_LENGTH * 4
		requestAnimationFrame(analyse)
	}
	
	// 4. Choose final destination of audio, for example your system speakers
	
	// 5. Connect the sources up to the effects, and the effects to the destination.
	//    ie: connect everything together
	//    source -> analyser -> context.destination
	source.connect(analyser)
	//analyser.connect(context.destination)
	
	// 6. DO STUFF	
	requestAnimationFrame(analyse)
	
})

//======//
// Drum //
//======//
const average = (ns) => {
	const total = ns.reduce((a, b) => a + b, 0)
	return total / ns.length
}

let lastDrumTime = 0
const diffs = []
let drumDiff = average(diffs)
let drumShimmers = 0

const DRUM_RESET_THRESHOLD = 2

canvas.on.mousedown(e => {
	tempoMode = "drum"	
	const diff = currTime - lastDrumTime
	lastDrumTime = currTime
	diffs.push(diff)
	if (diff > DRUM_RESET_THRESHOLD) {
		diffs.length = 0
		currFrameNumber = 7
	}
	diffStack = 0
	drumDiff = getDrumDiff(diffs) / SEQUENCE_LENGTH * 4
})

const getDrumDiff = (diffs) => {
	if (diffs.length === 0) return undefined
	if (diffs.length === 1) return diffs[0]
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
let tempoMode = "drum"
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
	
	const activeDiff = tempoMode == "drum"? drumDiff : stereoDiff
	
	while (diffStack > activeDiff) {
		currFrameNumber = wrap(currFrameNumber + 1, SEQUENCE_LENGTH)
		diffStack -= activeDiff
	}
	ctx.drawImage(frames[currFrameNumber], imageDrawX, imageDrawY, imageDrawWidth, imageDrawHeight)
	requestAnimationFrame(draw)
}

const wrap = (n, max) => n % max

requestAnimationFrame(draw)
