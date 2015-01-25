var m = require('mithril')

function model() {
	return {
		pomodoro: m.prop(25),
		shortBreak: m.prop(5),
		longBreak: m.prop(15)
	}
}

function controller(data=model()) {
	return {
		model: data
	}
}

function numberInput(label, attr) {
	return m('label', [
		m('span', label),
		m('input[type="number"][min="0"]', {
			onchange: m.withAttr('value', attr),
			value: attr()
		})
	])
}

function view(ctrl=controller()) {
	return m('ul.options', [
		m('li', [numberInput('Pomodoro', ctrl.model.pomodoro)]),
		m('li', [numberInput('Short Break', ctrl.model.shortBreak)]),
		m('li', [numberInput('Long Break', ctrl.model.longBreak)])
	])
}

module.exports = {model, view, controller}
