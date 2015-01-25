var m = require('mithril')
var pomodori = require('./pomodori')

window.onload = function () {
	m.module(document.getElementById('main'), pomodori)
}
