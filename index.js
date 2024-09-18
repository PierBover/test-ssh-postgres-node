import fs from 'fs';
import {Client} from 'ssh2';
import postgres from 'postgres';

const sshClient = new Client();

const sshOptions = {
	host: process.env.HOST_SSH,
	port: 22,
	username: 'root',
	privateKey: fs.readFileSync('private.key')
}

const dbSocket = ({ host: [host], port: [port] }) => new Promise((resolve, reject) => {
	sshClient
	.on('error', (error) => {
		console.log(error);
		reject();
	})
	.on('ready', () =>
		sshClient.forwardOut(
			'0.0.0.0',
			5432,
			host,
			port,
			(err, socket) => err ? reject(err) : resolve(socket)
		)
	)
	.connect(sshOptions);
});

const sql = postgres({
	database: 'postgres',
	username: 'postgres',
	password: process.env.DB_PASSWORD,
	keep_alive: null,
	socket: dbSocket
});

const rows = await sql`select * from "Fruits"`;

console.log(rows);

process.exit();