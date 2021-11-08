import { init } from './pixel/init.js'
import { draw } from './pixel/draw.js'
import { input } from './pixel/input.js'
import { collision } from './pixel/collision.js'

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

init('canvas', 180, 320)
draw.uploadSprite(sp, { offsetX: 0, offsetY: 0, width: 8, height: 8 })
draw.uploadSprite(sp2, { offsetX: 8, offsetY: 0, width: 8, height: 8 })
draw.uploadSprite(sp2, { offsetX: 0, offsetY: 8, width: 8, height: 8 })
draw.uploadSprite(sp, { offsetX: 8, offsetY: 8, width: 8, height: 8 })
draw.uploadPalette(palette, 0)
draw.uploadPalette(palette2, 1)
//320, 180

let a = 0
let b = 100
const box2 = { x: 0, y: 0, width: 16, height: 16 }
const f = delta => {
	draw.clear()
	draw.flip(false, false)
	draw.palette(0)
	let foo = { offsetX: 0, offsetY: 0, width: 8, height: 8 }
	draw.sprite(foo)
	for (let x = 0; x < 10; x++) {
		draw.position(8 * x, 0)
		draw.draw()
	}
	for (let x = 0; x < 10; x++) {
		draw.position(8 * x, 8 * 10)
		draw.draw()
	}
	for (let x = 0; x < 11; x++) {
		draw.position(8 * 10, 8 * x)
		draw.draw()
	}

	draw.sprite({ offsetX: 0, offsetY: 0, width: 16, height: 16 })
	draw.palette(1)
	const box1 = { x: 100 + (Math.sin(a) * 10), y: 100 + (Math.cos(a) * 10), width: 16, height: 16 }

	draw.position(box1.x, box1.y)
	draw.draw()
	if (input.is()) {
		let p = input.get()
		console.log(p[0])
		box2.x = p[0].x
		box2.y = p[0].y
	}
	draw.position(box2.x, box2.y)
	if (collision.boxToBox(box1, box2)) {
		draw.palette(0)
		draw.flip(true, true)
	}
	draw.draw()
	a += 1 * delta
}

document.addEventListener('keypress', (e) => {
	if (e.key == 'f')
		draw.toggleFullScreen()
})
draw.loop(f)
