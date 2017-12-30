/**
 * Created by igor on 30.10.16.
 */

"use strict";
// Modules and utils

let fs = require('fs'),
	async = require('async');

// Vars

let add = 'ais' || process.env.add,
	path = '/var/www/' + add;

// Code

if (!add) {
	return console.log('Not have host ' + add);
}

async.series([
	(call) => {
		fs.mkdir(path, (e) => {
			if (e) {
				console.log('ERR', e);
			}
			call();
		});
	},
	(call) => {
		fs.writeFile(`/etc/apache2/sites-available/${add}.conf`, SitesAvailable (), (e) => {
			if (e) {
				console.log('ERR', e);
			}
			call();
		});
	},
	(call) => {
		fs.appendFile('/etc/hosts', `\n 127.0.0.1 ${add} \n`, call);
	},
], (e) => {
	if (e) {
	  console.log('ERR ', e);

	}

	console.log(`Finish. \n Enable site with command <<sudo a2ensite ${add}>> \n restart apache2
	\n Change user folder ${path} `);

});

let SitesAvailable =  () => {
	return `
		<VirtualHost *:80>
			ServerAdmin admin@example.com
			ServerName ${add}
			ServerAlias www.${add}
			DocumentRoot ${path}
			ErrorLog \$\{APACHE_LOG_DIR}/error.log
			CustomLog \$\{APACHE_LOG_DIR}/access.log combined
			#for mod rewrite
			<Directory ${path}>
				Options -Indexes +FollowSymLinks +MultiViews
				AllowOverride All
				Require all granted
			</Directory>
			php_value upload_max_filesize 210M
			php_value post_max_size 220M
			php_value memory_limit 512M
			php_value xdebug.remote_enable On
		</VirtualHost>
	`;
}
