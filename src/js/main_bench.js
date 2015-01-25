module.exports = {
	name: 'Main App',
	maxTime: 2,
	tests: [
		{
			name: 'Just multiplies some numbers',
			fn: function() {
				return 10 * 10 * 2000000
			}
		}
	]
}
