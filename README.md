# overseer

> a discord bot for checking [csgo](https://blog.counter-strike.net/) and [faceit](https://www.faceit.com/) player stats

![Open in Remote - Containers](https://img.shields.io/static/v1?label=Remote%20-%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/l1fescape/overseer)

## usage

open the csgo dev console while playing the game and type `status` to get a list of players that are currently connected to the server. Copy and paste the output of this command into a channel that the discord bot is in.

## running the bot

```
$ npm install
$ npm start
```

with docker:
```
$ npm run docker
```

with docker on an m1 mac:
```
$ npm run docker:arm
```