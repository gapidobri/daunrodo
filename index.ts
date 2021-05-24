import { Client, Message, MessageEmbed } from 'discord.js'
import youtubedl, { Youtubedl } from 'youtube-dl'
import progress, { Progress } from 'progress-stream'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import config from './config.json'
import dotenv from 'dotenv'

dotenv.config()

try {
  fs.mkdirSync('download')
} catch (e) {}

const bot: Client = new Client()
let downloads: Array<String> = []

bot.on('ready', () => {
  console.log('Bot is online')
})

bot.on('message', (msg) => {
  const message: string = msg.content.trim()
  const prefix: string = message.split('')[0]
  const command = message.split(' ')[0].substring(1)
  const args: string[] = message.split(' ')
  args.shift()
  if (prefix !== config.prefix) return
  switch (command) {
    case 'dl':
      download(msg, args[0])
      break
  }
})

const download = async (message: Message, url: string) => {
  downloads.push(url)
  const embed: MessageEmbed = new MessageEmbed()
    .setTitle('Downloading')
    .setURL(url)
    .setDescription('Preparing download')

  const reply: Message = await message.channel.send(embed)

  console.log(`Download requested by ${message.author.username}`)

  const video: Youtubedl = youtubedl(url, [], { cwd: __dirname })

  video.once('info', async (info) => {
    const filenameLong: string = info._filename.replace('.mp4', '')
    const filenameArr: string[] = filenameLong.split('-')
    filenameArr.pop()
    const filename: string = filenameArr.join('-')

    embed
      .setTitle(`Downloading **${filename}**`)
      .setURL(url)
      .setDescription('Preparing download')
    await reply.edit(embed)

    console.log(`Downloading ${filename}`)

    const str = progress({
      length: info.size,
      time: 500,
    })

    let prog: Progress

    str.on('progress', async (p) => {
      prog = p
    })

    const interval = setInterval(async () => {
      if (!downloads.includes(url)) return
      const percentage: number = Math.round(prog.percentage)
      const progressBar: string = makeProgressBar(percentage, 30)
      embed.setDescription(`${progressBar} ${percentage} % / eta ${prog.eta} s`)
      console.log(`Downloaded ${percentage} %`)
      await reply.edit(embed)

      if (percentage === 100) {
        downloads = downloads.filter((d) => d != url)
        interval.unref()
        embed.setDescription('Download complete')
        console.log('Download completed')
        await reply.edit(embed)
        await message.channel.send({
          files: [filePath],
        })
        fs.unlinkSync(filePath)
      }
    }, 2000)

    const proc = ffmpeg({ source: video.pipe(str) })

    const filePath: string = path.join('download', filename + '.mp3')
    proc.saveToFile(filePath)

    video.on('close', async () => {})
  })
}

const makeProgressBar = (percent: number, sections: number): string => {
  let progressBar: string = ''
  const secPercent: number = 100 / sections
  const secAmount: number = Math.round(percent / secPercent)
  for (let i: number = 0; i < sections; i++) {
    if (i <= secAmount) progressBar += '█'
    else progressBar += '▒'
  }
  return progressBar
}

bot.login(process.env.TOKEN)
