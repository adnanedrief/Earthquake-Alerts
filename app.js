const Discord = require('discord.js')
const axios = require('axios')

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES']
})
const config = require('./config.json') // before setup make sure config.json has been filled in

// Set command prefix
const prefix = '!'

// set magnitude of earthquake
let magnitude = 4

// Set refresh and alert intervals
let refreshInterval = 1
let alertInterval = 1

// Set earthquake IDs that have already been sent as alerts
let sentEarthquakes = []

// Set alert channel and countries of interest
let alertChannel = '#general'
let countriesOfInterest = []

function sendAlert (channel, earthquake) {
  if (!channel) return console.error('No alert channel set!')

  // Get Google Maps link for earthquake location

  const url = `https://www.google.com/maps/search/?api=1&query=${earthquake.geometry.coordinates[1]},${earthquake.geometry.coordinates[0]}`
  console.log(earthquake)
  // Create Discord message embed with earthquake details
  const message = new Discord.MessageEmbed()
    .setTitle('🚨 EARTHQUAKE ALERT 🚨')
    .setDescription(
      `There has been an earthquake of magnitude ${earthquake.properties.mag} at ${earthquake.properties.place}.`
    )
    .addField('Magnitude', `${earthquake.properties.mag} km`, true)
    .addField('Depth', `${earthquake.geometry.coordinates[2]} km`, true)
    .addField('Location', `${earthquake.properties.place}`, true)
    .addField('Coordinates', ' ', true)
    .addField('Latitude', `${earthquake.geometry.coordinates[1]}`, true)
    .addField('Longitude', `${earthquake.geometry.coordinates[0]}`, true)
    .addField('Google Maps Link', `${url}`)
    .setURL(`${url}`)
    .setColor('#ff0000')
    .setTimestamp()
  // Send alert message to specified channel
  channel.send({
    embeds: [message]
  })
}

// Function to refresh earthquake data
async function start () {
  try {
    // Get earthquake data from USGS API
    const url =
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
    const response = await axios.get(url)

    // Filter earthquakes by latitude and longitude
    const earthquakes = response.data.features.filter(earthquake => {
      const [longitude, latitude] = earthquake.geometry.coordinates
      return (
        latitude >= 0 && latitude <= 90 && longitude >= -180 && longitude <= 180
      )
    })

    // Check for earthquakes that meet alert criteria and send alerts
    earthquakes.forEach(earthquake => {
      if (earthquake.properties.mag > magnitude) {
        const now = new Date()
        const eventTime = new Date(earthquake.properties.time)
        const timeSinceEvent = Math.abs(now - eventTime)
        const minutesSinceEvent = Math.floor(timeSinceEvent / 1000 / 60)
        const location =
          earthquake.properties.place.split(', ')[
            earthquake.properties.place.split(', ').length - 1
          ]
        if (
          minutesSinceEvent <= alertInterval &&
          !sentEarthquakes.includes(earthquake.id) &&
          countriesOfInterest.includes(location)
        ) {
          sentEarthquakes.push(earthquake.id)
          sendAlert(alertChannel, earthquake)
        }
      }
    })

    // Log refresh time and schedule next refresh
    console.log(`Data refreshed at ${new Date()}.`)
  } catch (error) {
    console.error(error)
  }
  setTimeout(start, 60 * refreshInterval * 1000)
}

// Set up bot commands
client.on('messageCreate', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  // Set alert channel
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'alertchannel'
  ) {
    const channel = message.mentions.channels.first()
    if (!channel) return message.reply('Invalid channel!')
    alertChannel = channel
    message.reply(`Alerts will be sent to ${channel} from now on.`)
  }

  // Set refresh interval
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'refresh'
  ) {
    const interval = parseInt(
      message.content.slice('!refresh'.length).trim().split(/ +/)[0]
    )
    if (!Number.isInteger(interval)) return message.reply('Invalid interval!')
    refreshInterval = interval
    message.reply(
      `Data will be refreshed every ${interval} minute(s) from now on.`
    )
  }

  // Set alert interval
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'alertinterval'
  ) {
    const interval = parseInt(
      message.content.slice('!alertinterval'.length).trim().split(/ +/)[0]
    )
    if (!Number.isInteger(interval)) return message.reply('Invalid interval!')
    alertInterval = interval
    message.reply(
      `Alerts will be sent for earthquakes within the last ${interval} minute(s) from now on.`
    )
  }
  //set magnitude
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'setmagnitude'
  ) {
    const mag = parseInt(
      message.content.slice('!setmagnitude'.length).trim().split(/ +/)[0]
    )
    if (!Number.isInteger(mag)) return message.reply('Invalid magnitude!')
    magnitude = mag
    message.reply(
      `Earthquake alerts will be sent for magnitude greater than or equal to ${magnitude} from now on.`
    )
  }

  // Add country of interest
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'addcountry'
  ) {
    const country = message.content
      .slice('!addcountry'.length)
      .trim()
      .split(/ +/)[0]
    if (!country) return message.reply('Invalid country!')
    countriesOfInterest.push(country)
    message.reply(
      `${country} has been added to the list of countries of interest.`
    )
  }

  // List countries of interest
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'listcountries'
  ) {
    if (countriesOfInterest.length === 0)
      return message.reply('There are no countries of interest set.')
    const list = countriesOfInterest.join(', ')
    message.reply(`Countries of interest: [${list}]`)
  }

  // Show command help
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'help'
  ) {
    const helpMessage = new Discord.MessageEmbed()
      .setColor(0x0099ff)
      .setTitle('📖 Commands')
      .setDescription('List of commands and their usage.')
      .setColor('#00ff00')
      .setTimestamp()
      .addFields(
        {
          name: `**${prefix}alertchannel #channel**`,
          value: 'Set the channel where earthquake alerts will be sent.'
        },
        {
          name: `**${prefix}refresh <interval>**`,
          value: 'Set the interval for refreshing earthquake data (in minutes).'
        },
        {
          name: `**${prefix}alertinterval <interval>**`,
          value: 'Set the interval for sending earthquake alerts (in minutes).'
        },
        {
          name: `**${prefix}addcountry <country>**`,
          value: 'Add a country of interest for earthquake alerts.'
        },
        {
          name: `**${prefix}listcountries**`,
          value: 'List all countries currently set for earthquake alerts.'
        },
        {
          name: `**${prefix}setmagnitude <magnitude>**`,
          value: 'Set the minimum magnitude threshold for earthquake alerts.'
        },
        {
          name: `**${prefix}todayalerts**`,
          value: 'Get all earthquake alerts for today.'
        },
        {
          name: `**${prefix}todayalertfor <country>**`,
          value: 'Get all earthquake alerts for a specific country for today.'
        },
        {
          name: `**About :**`,
          value: 'Created by **Adnane Drief**'
        },
        {
          name: `**Github :**`,
          value: '**https://github.com/adnanedrief/Earthquake-Alerts**'
        }
      )
    message.channel.send({
      embeds: [helpMessage]
    })
  }
  // Today's alerts
  if (
    message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase() === 'todayalerts'
  ) {
    console.log('Start')
    ;(async () => {
      try {
        const url =
          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
        const response = await axios.get(url)
        // console.log(response.data.features);
        console.log('fetching done')

        const earthquakes = response.data.features.filter(earthquake => {
          return earthquake.properties.mag > magnitude
        })

        earthquakes.forEach(earthquake => {
          //console.log(earthquake);
          sendAlert(message.channel, earthquake)
        })
        console.log('result sent')
        if (message.channel.type === 'GUILD_TEXT') {
          message.reply(`All earthquake alerts sent to ${message.channel}.`)
        }
      } catch (error) {
        console.error(error)
        message.reply('Failed to fetch earthquake data.')
      }
    })()
    console.log('End')
  }
  // Today's alerts for a specific country
  if (message.content.slice(prefix.length).trim().startsWith('todayalertfor')) {
    const countryName = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/)[1]
    console.log('Start')
    ;(async () => {
      try {
        const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
        const response = await axios.get(url)
        console.log('fetching done')

        const earthquakes = response.data.features.filter(earthquake => {
          return (
            earthquake.properties.place
              .toLowerCase()
              .includes(countryName.toLowerCase()) &&
            earthquake.properties.mag > magnitude
          )
        })

        if (earthquakes.length > 0) {
          earthquakes.forEach(earthquake => {
            sendAlert(message.channel, earthquake)
          })
          console.log('result sent')
          if (message.channel.type === 'GUILD_TEXT') {
            message.reply(
              `All earthquake alerts for ${countryName} sent to ${message.channel}.`
            )
          }
        } else {
          if (message.channel.type === 'GUILD_TEXT') {
            message.reply(
              `No earthquakes found for ${countryName} in the past day.`
            )
          }
        }
      } catch (error) {
        console.error(error)
        message.reply('Failed to fetch earthquake data.')
      }
    })()
  }
})

// Log and handle errors
client.on('error', error => {
  console.error(error)
})

// Log in with bot token and start data refresh
client.login(config.BOT_TOKEN)
start()
