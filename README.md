# Earthquake Alerts Discord Bot

This is a Discord bot that provides earthquake alerts to its users. The bot is built using Node.js v16 and the Discord.js v13 library. It makes use of the USGS Earthquake API to get the latest earthquake data.

# Features

The bot has the following features:

- Set a channel where earthquake alerts will be sent
- Set the interval for refreshing earthquake data (in minutes)
- Set the interval for sending earthquake alerts (in minutes)
- Add countries of interest for earthquake alerts
- List all countries currently set for earthquake alerts
- Set the minimum magnitude threshold for earthquake alerts
- Get all earthquake alerts for today
- Get all earthquake alerts for a specific country for today
- Show command help

# Installation & Configuration
1) Clone the repository:

``` git clone https://github.com/adnanedrief/Earthquake-Alerts.git ```

2) Install dependencies:

``` npm install nodemon axios discord.js@13.15.1 ```

3) Replace the **BOT_TOKEN** in the **config.json** file with your Discord bot token.

4) Start the bot:

``` nodemon app.js```


# Usage

To use the bot, you can use the following commands:

- **!alertchannel #channel** - Set the channel where earthquake alerts will be sent.
- **!refresh <interval>** - Set the interval for refreshing earthquake data (in minutes).
- **!alertinterval <interval>** - Set the interval for sending earthquake alerts (in minutes).
- **!addcountry <country>** - Add a country of interest for earthquake alerts.
- **!listcountries** - List all countries currently set for earthquake alerts.
- **!setmagnitude <magnitude>** - Set the minimum magnitude threshold for earthquake alerts (default value is 4 ).
- **!todayalerts** - Get all earthquake alerts for today.
- **!todayalertfor <country>** - Get all earthquake alerts for a specific country for today.
- **!help** - Show command help.


# Demo 



https://user-images.githubusercontent.com/76531566/232930811-a1203769-2503-4ed2-aa09-7cc07b8d49c4.mp4



# Adding the Bot to Your Server
To add this bot to your server, you can use the following link:
**[Add Me To Your Server](https://discord.com/api/oauth2/authorize?client_id=1097293999515127858&permissions=8&scope=bot "Add Me To Your Server")**

**Make sure to authorize the bot with the necessary permissions to read and send messages, as well as manage webhooks and embeds. With these permissions, the bot will be able to function properly in your server.**

# Contributing

Contributions are welcome! If you have any ideas, feel free to open an issue or a pull request.
