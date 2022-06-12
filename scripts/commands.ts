import { deregisterCommands, registerCommands } from '../src/discord/handlers'

(async () => {
	const action = process.argv[2]
	switch (action) {
		case 'register':
			await registerCommands()
			process.exit(0)
		case 'deregister':
		default:
			await deregisterCommands()
			process.exit(0)
	}
})()