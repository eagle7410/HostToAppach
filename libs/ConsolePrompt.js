const ConsoleColorLog = require('console-color');

class ConsolePrompt {
	constructor () {
		this._log = new ConsoleColorLog();
	}

	ask (question) {
		const stdin = process.openStdin();
		this._log.q(`${question} ? :`);

		return new Promise((ok,bad)=> {
			stdin.addListener('data', answer => {
				ok(answer.toString());
			});

			stdin.addListener('error', bad);
		});
	}
}

module.exports = ConsolePrompt;
