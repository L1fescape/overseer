# Overseer

> Discord bot for checking [csgo](https://blog.counter-strike.net/) and [faceit](https://www.faceit.com/) player stats

[![Open in Remote - Containers](https://img.shields.io/static/v1?label=Remote%20-%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/l1fescape/overseer)

## Usage

In csgo open the dev console and type `status` to get a list of players that are currently connected to the server.

Copy and paste the output of this command into a channel and the bot will parse the steam ids, lookup each player's steam csgo stats and faceit stats, and then return the result as an embed in the channel.

## Running the Application

```
$ npm install
$ npm start
```
