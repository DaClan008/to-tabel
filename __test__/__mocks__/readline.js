global.rl = {
	move: [],
	clearScreenSpy: 0,
	clean: () => {
		global.rl.move = [];
		global.rl.clearScreenSpy = 0;
	}
}

// eslint-disable-next-line no-undef
const rl = jest.createMockFromModule('readline');

const moveCursor = (streamer, left, lines, callback) => {
	global.rl.move.push({ left, lines });
	callback();
	return true;
};
const clearScreenDown = (streamer, callback) => {
	global.rl.clearScreenSpy++;
	callback();
	return true;
}
rl.moveCursor = moveCursor;
rl.clearScreenDown = clearScreenDown;
rl.test = 'TEST';
module.exports = rl;
