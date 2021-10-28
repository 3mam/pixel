import { pixel as d } from './pixel.js'


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

d.set('canvas', 180, 320)
d.uploadSprite(sp, { offsetX: 0, offsetY: 0, width: 8, height: 8 })
d.uploadSprite(sp2, { offsetX: 8, offsetY: 0, width: 8, height: 8 })
d.uploadPalette(palette, 0)
d.uploadPalette(palette2, 1)
//320, 180

let a = 0
let b = 100
const box2 = { x: 0, y: 0, width: 16, height: 8 }
const f = delta => {
	d.clear()
	d.flip(false,false)
	d.palette(0)
	let foo = { offsetX: 0, offsetY: 0, width: 8, height: 8 }
	d.sprite(foo)
	for (let x = 0; x < 10; x++) {
		d.position(8 * x, 0)
		d.draw()
	}
	for (let x = 0; x < 10; x++) {
		d.position(8 * x, 8 * 10)
		d.draw()
	}
	for (let x = 0; x < 11; x++) {
		d.position(8 * 10, 8 * x)
		d.draw()
	}

	d.sprite({ offsetX: 0, offsetY: 0, width: 16, height: 16 })
	d.palette(1)
	const box1 = { x: 100 + (Math.sin(a) * 10), y: 100 + (Math.cos(a) * 10), width: 16, height: 8 }

	d.position(box1.x, box1.y)
	d.draw()
	if (d.isInput()) {
		let p = d.getInput()
		console.log(p[0])
		box2.x = p[0].x
		box2.y = p[0].y
	}
	d.position(box2.x, box2.y)
	if (d.boxCollision(box1, box2)) {
		d.palette(0)
		d.flip(false,true)
	}
	d.draw()
	a += 1 * delta

}

document.addEventListener('keypress', (e) => {
	if (e.key == 'f')
		d.toggleFullScreen()
})
d.loop(f)
