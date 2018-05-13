const sudo = require('sudo');

const cmdPrepare = (cmd) =>
	!Array.isArray(cmd)
	? cmd.replace(/(\s+)/g, ' ').split(' ')
	: cmd;

class SudoExec {
	constructor () {
		this._sudo = sudo;
		this._options = {
			cachePassword: false,
			prompt: 'Sudo password? ',
			spawnOptions: { /* other options for spawn */ }
		};
	}

	run (cmd) {
		return new Promise((ok,bad)=> {
			const child = this._sudo(cmdPrepare(cmd), this._options);
			let result = '';

			child.stdout
				.on('data', data => result = data.toString())
				.on('end', () => ok(result))
				.on('error', (err) => bad(err));
		});
	}
}

module.exports = SudoExec;
