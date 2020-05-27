import {HTML} from "./Habitat/Document.js"
import {print} from "./Habitat/Console.js"
import RealTimeBPMAnalyzer from 'realtime-bpm-analyzer';
import "./Media/Hands.png"
import "./Media/Stereo.png"
import "./Media/Drum.png"
import "./Media/BounceImageSequence/BounceSequence0.png"
import "./Media/BounceImageSequence/BounceSequence1.png"
import "./Media/BounceImageSequence/BounceSequence2.png"
import "./Media/BounceImageSequence/BounceSequence3.png"
import "./Media/BounceImageSequence/BounceSequence4.png"
import "./Media/BounceImageSequence/BounceSequence5.png"
import "./Media/BounceImageSequence/BounceSequence6.png"
import "./Media/BounceImageSequence/BounceSequence7.png"
import "./Media/BounceImageSequence/BounceSequence8.png"
import "./Media/BounceImageSequence/BounceSequence9.png"
import "./Media/BounceImageSequence/BounceSequence10.png"
import "./Media/BounceImageSequence/BounceSequence11.png"
import "./Media/BounceImageSequence/BounceSequence12.png"
import "./Media/BounceImageSequence/BounceSequence13.png"
import "./Media/BounceImageSequence/BounceSequence14.png"
import "./Media/BounceImageSequence/BounceSequence15.png"
import "./Media/BounceImageSequence/BounceSequence16.png"
import "./Media/BounceImageSequence/BounceSequence17.png"
import "./Media/BounceImageSequence/BounceSequence18.png"
import "./Media/BounceImageSequence/BounceSequence19.png"
import "./Media/BounceImageSequence/BounceSequence20.png"
import "./Media/BounceImageSequence/BounceSequence21.png"
import "./Media/BounceImageSequence/BounceSequence22.png"
import "./Media/BounceImageSequence/BounceSequence23.png"
import "./Media/BounceImageSequence/BounceSequence24.png"
import "./Media/BounceImageSequence/BounceSequence25.png"
import "./Media/BounceImageSequence/BounceSequence26.png"
import "./Media/BounceImageSequence/BounceSequence27.png"
import "./Media/BounceImageSequence/BounceSequence28.png"
import "./Media/BounceImageSequence/BounceSequence29.png"
import "./Media/BounceImageSequence/BounceSequence30.png"
import "./Media/BounceImageSequence/BounceSequence31.png"
import "./Media/BounceImageSequence/BounceSequence32.png"

//========//
// Frames //
//========//
const SEQUENCE_LENGTH = 33
const IMAGE_WIDTH = 1920
const IMAGE_HEIGHT = 1080
const ASPECT_RATIO = IMAGE_HEIGHT / IMAGE_WIDTH

const frames = []
for (let i = 0; i < SEQUENCE_LENGTH; i++) {
	const src = require(`./Media/BounceImageSequence/BounceSequence${i}.png`)
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
window.addEventListener("resize", resizeCanvas)

//======//
// Hands //
//======//
const hands = new Image()
hands.src = require("./Media/Hands.png")
hands.style.position = "fixed"
hands.style.right = 0
hands.style.width = "100%"

document.body.appendChild(hands)

const resizeHands = () => {
	hands.style.top = (canvas.width * ASPECT_RATIO * 0.5) + "px"
}

resizeHands()
window.addEventListener("resize", resizeHands)

//========//
// Stereo //
//========//
const stereo = new Image()
stereo.src = require("./Media/Stereo.png")
stereo.style.position = "fixed"
stereo.style.left = 0
stereo.style.bottom = 0
stereo.style.height = "30%"
document.body.appendChild(stereo)

/*const player = HTML `<audio id="player" controls></audio>`
player.style.position = "fixed"
document.body.appendChild(player)*/

let stereoInit = false
const tempos = []
let stereoTempo = undefined
let stereoDiff = NaN

stereo.addEventListener("click", async e => {
	tempoMode = "stereo"
	stereoDiff = NaN
	
	if (stereoInit) return
	stereoInit = true
	
	const context = new AudioContext()
	const stream = await navigator.mediaDevices.getUserMedia({audio: true})
	const input = context.createMediaStreamSource(stream)
	const scriptProcessorNode = context.createScriptProcessor(4096, 1, 1)
	
	input.connect(scriptProcessorNode)
	scriptProcessorNode.connect(context.destination)
	//input.connect(context.destination)
	
	const onAudioProcess = new RealTimeBPMAnalyzer({
		scriptNode: {
			bufferSize: 4096,
			numberOfInputChannels: 1,
			numberOfOutputChannels: 1,
		},
		//computeBPMDelay: 5000,
		//stabilizationTime: 1000,
		continuousAnalysis: true,
		pushTime: 3500,
		pushCallback(err, bpm, threshold) {
			if (err) {
				print("Listening...")
				tempos.length = 0
			}
			if (bpm) {
				const bpmTempo = bpm[0].tempo
				//const bpmTempo = average(bpm.map(b => b.tempo))
				tempos.push(bpmTempo)
				stereoTempo = average(tempos)
				print(stereoTempo)
				stereoDiff = (60 / bpmTempo) / SEQUENCE_LENGTH * 4
			}
		},
		onBpmStabilized(threshold) {
			onAudioProcess.clearValidPeaks(threshold)
		},
	})
	
	scriptProcessorNode.onaudioprocess = (e) => onAudioProcess.analyze(e)
	
})

//======//
// Drum //
//======//
const drum = new Image()
drum.src = require("./Media/Drum.png")
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

drum.addEventListener("mousedown", e => {
	tempoMode = "drum"
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
	ctx.drawImage(frames[currFrameNumber], 0, 0, canvas.width, canvas.width * ASPECT_RATIO)
	requestAnimationFrame(draw)
}

const wrap = (n, max) => n % max

requestAnimationFrame(draw)
