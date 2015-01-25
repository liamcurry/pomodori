var m = require('mithril')

function viewModel() {
	var msTotal = m.prop(25 * 60 * 1000)
	var msLeft = m.prop(msTotal())
	var ticker = m.prop()

	function toString() {
		var ms = msLeft()
		var min = Math.floor(ms / 60000)
		var sec = Math.floor(ms % 60000 / 1000)
		return `${min}:${sec}`
	}

	return {msTotal, msLeft, ticker, toString}
}

function controller(vm=viewModel()) {
	var updateTime
	function update() {
		var msElapsed = Date.now() - updateTime
		m.startComputation()
		vm.msLeft(Math.max(vm.msLeft() - msElapsed, 0))
		m.endComputation()
		updateTime = Date.now()
	}

	var ticker = m.prop()
	function start() {
		vm.ticker(setInterval(update, 1000))
		updateTime = Date.now()
	}
	function stop() {
		vm.ticker(clearInterval(vm.ticker()))
	}
	function toggle() {
		ticker() ? stop() : start()
	}

	return {vm, start, stop, toggle}
}

function view(ctrl) {
	return m('.timer', [
		m('.timer-circle'),
		m('p', [
			m('.span', 'Time left'),
			m('.span', ctrl.vm.toString())
		])
	])
}

module.exports = {viewModel, controller, view}
