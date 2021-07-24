import { Pixel } from './pixel.js'

const toggleFullScreen = () =>
	!document.fullscreenElement
		? document.getElementById('canvas').requestFullscreen()
		: document.exitFullscreen
			? document.exitFullscreen()
			: null

document.getElementById('foo').onclick = toggleFullScreen

const sp = [
	3, 0, 3, 0, 3, 0, 1, 1, //8
	0, 0, 0, 0, 0, 0, 0, 1, //16
	3, 0, 2, 0, 0, 2, 0, 0, //24
	0, 0, 0, 2, 2, 0, 0, 3, //32
	3, 0, 0, 2, 2, 0, 0, 0, //40
	0, 0, 2, 0, 0, 2, 0, 3, //48
	3, 0, 0, 0, 0, 0, 0, 0, //56
	0, 3, 0, 3, 0, 3, 0, 3, //64
]
const sp2 = [
	3, 0, 3, 0, 3, 0, 1, 1, //8
	0, 0, 0, 0, 0, 0, 0, 1, //16
	3, 0, 2, 0, 0, 2, 0, 0, //24
	0, 0, 0, 3, 3, 0, 0, 3, //32
	3, 0, 0, 3, 3, 0, 0, 0, //40
	0, 0, 2, 0, 0, 2, 0, 3, //48
	3, 0, 0, 0, 0, 0, 0, 0, //56
	0, 3, 0, 3, 0, 3, 0, 3, //64
]

const palette = Array(32 * 4).fill(0)
palette[4] = 255
palette[5] = 0
palette[6] = 0
palette[7] = 255

palette[8] = 0
palette[9] = 255
palette[10] = 0
palette[11] = 255

palette[12] = 0
palette[13] = 0
palette[14] = 255
palette[15] = 255

const palette2 = Array(32 * 4).fill(0)
palette2[4] = 255
palette2[5] = 255
palette2[6] = 0
palette2[7] = 255

palette2[8] = 0
palette2[9] = 255
palette2[10] = 255
palette2[11] = 255

palette2[12] = 255
palette2[13] = 0
palette2[14] = 255
palette2[15] = 255

console.log(palette.length)
const pix = Pixel.create('canvas', 320, 180)
	.uploadSprite(sp, 0, 0, 8, 8)
	.uploadSprite(sp2, 8, 0, 8, 8)
	.uploadPalette(0, palette)
	.uploadPalette(1, palette2)
//320, 180

let a = 0
let b = 100
let last = 0
const loop = () => (timestamp) => {
	const delta = Math.min(1, (timestamp - last) / 1000)
	last = timestamp
	pix
		.clear()
		.palette(0)
		.sprite(0, 0, 8, 8)
	for (let x = 0; x < 10; x++) {
		pix
			.position(8 * x, 0)
			.draw()
	}
	for (let x = 0; x < 10; x++) {
		pix
			.position(8 * x, 8 * 10)
			.draw()
	}
	for (let x = 0; x < 11; x++) {
		pix
			.position(8 * 10, 8 * x)
			.draw()
	}

	pix
		.sprite(8, 0, 8, 8)
		.palette(1)
		.position(100 + (Math.sin(a) * 10), 100 + (Math.cos(a) * 10))
		.draw()

	a += 5 * delta
	window.requestAnimationFrame(loop())
}
loop()(0)
