/**
 * Created by igor on 30.10.16.
 * Updated by igor on 13.05.18.
 */

// Require libs, modules, etc...
const ConsolePrompt   = require('./libs/ConsolePrompt');
const SudoExec        = require('./libs/SudoExec');
const ConsoleColorLog = require('console-color');
const fs              = require('fs');
const {promisify}     = require('util');

// Init libs, modules, etc...
const prompt = new ConsolePrompt();
const sudo   = new SudoExec();
const log    = new ConsoleColorLog();
const reader = promisify(fs.readFile);
const exists = promisify(fs.exists);
const mkdir  = promisify(fs.mkdir);

const createFolder = async (dir) => {

	let has = await exists(dir);

	if (has) {
		log.warn(`${dir} already exists.`);

		return true;
	}

	await mkdir(dir);

	let web = dir + '/web';

	has = await exists(web);

	if (!has)  await mkdir(web);

	return true;
};

const createSitesAvailable = async (host, content) => {
	const file = '/etc/apache2/sites-available/' + host +'.conf';

	let has = await exists(file);

	if (has) {
		throw `${file} already exists.`;
	}

	await sudo.run(['sh', '-c',`echo "${content}" > ${file}`]);

	return true;
};

const appendToHosts = async (host) => {
	const hostFile = '/etc/hosts';
	let hostContent = await reader(hostFile);
	hostContent = hostContent.toString();

	if (hostContent.includes(`127.0.0.1 ${host}`)) {
		throw `${host} be include to /ect/hosts.`;
	}

	await sudo.run(['sh', '-c',`echo "${ `127.0.0.1 ${host}` }" >> ${hostFile}`]);

	return true;
};

void async function() {
	try {
		let host = await prompt.ask('Enter host name');
		host = host.replace(/[^A-z0-9\-]/g ,'');

		const dir = '/var/www/' + host;

		await createFolder(dir);
		await createSitesAvailable(host, SitesAvailable(dir, host));
		await appendToHosts(host);

		await sudo.run(['a2ensite', host]);
		await sudo.run('/etc/init.d/apache2 restart && ls');

		log.success(`Include virtual host ${host}..OK`);

	} catch (e) {
		log.error('ERROR \n ', e);
	}

	process.exit();
}();

function SitesAvailable (dir, host) {
	let web = dir + '/web';

	return `<VirtualHost *:80>
	ServerAdmin admin@example.com
	ServerName ${host}
	ServerAlias www.${host}
	DocumentRoot ${web}
	ErrorLog ${dir}/error.log
	CustomLog ${dir}/access.log combined
	#for mod rewrite
	<Directory ${web} >
		Options -Indexes +FollowSymLinks +MultiViews
		AllowOverride All
		Require all granted
	</Directory>
	php_value upload_max_filesize 210M
	php_value post_max_size 220M
	php_value memory_limit 512M
	php_value xdebug.remote_enable On
</VirtualHost>`;
}

