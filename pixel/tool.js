function loop(gameFnLoop) {
	let last = 0
	let gameObject
	const insideLoop = timestamp => {
		const delta = Math.min(1, (timestamp - last) / 1000)
		last = timestamp
		gameObject = gameFnLoop(delta, gameObject)
		window.requestAnimationFrame(insideLoop)
	}
	insideLoop(0)
}

function toggleFullScreen() {
	if (!document.fullscreenElement)
		document.documentElement.requestFullscreen()
	else if (document.exitFullscreen)
		document.exitFullscreen()
	screen.orientation.lock('portrait')
}

export const tool = {
	loop: loop,
	toggleFullScreen: toggleFullScreen
}