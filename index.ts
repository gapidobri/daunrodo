import { Client, Message, MessageEmbed } from 'discord.js';
import youtubedl, { Youtubedl } from 'youtube-dl';
import progress, { ProgressStream } from 'progress-stream';
import ffmpeg from 'fluent-ffmpeg';
import path, { PlatformPath } from 'path';
import fs, { WriteStream } from 'fs';
import config from './config.json';
import dotenv from 'dotenv';
import { isForInStatement } from 'typescript';
import { execFile } from 'child_process';
import { setServers } from 'dns';
dotenv.config();

const bot: Client = new Client();

bot.on('ready', () => {
    console.log('Bot is online');
})

bot.on('message', (msg) => {
    const message: string = msg.content.trim();
    const prefix: string = message.split('')[0];
    const command = message.split(' ')[0].substring(1);
    const args: string[] = message.split(' ');
    args.shift();
    if (prefix != config.prefix) return;
    switch (command) {
        case 'dl':
            download(msg, args[0]);
            break;
    }
});

const download = async (message: Message, url: string) => {

    const embed:MessageEmbed = new MessageEmbed()
    .setTitle('Downloading')
    .setURL(url)
    .setDescription('Preparing download');
    const reply:Message = await message.channel.send(embed); 

    const video: Youtubedl = youtubedl(url, [], { cwd: __dirname });

    video.once('info', async (info) => {
        const filenameLong:string = info._filename.replace('.mp4', '');
        const filenameArr:string[] = filenameLong.split('-');
        filenameArr.pop();
        const filename:string = filenameArr.join('-');

        embed
        .setTitle(`Downloading **${filename}**`)
        .setURL(url)
        .setDescription('Preparing download');
        await reply.edit(embed);

        const str = progress({
            length: info.size,
            time: 500,
        });
    
        str.on('progress', (prog) => {
            const percentage:number = Math.round(prog.percentage)
            const progressBar:string = makeProgressBar(percentage, 30);
            embed.setDescription(`${progressBar} ${percentage} % / eta ${prog.eta} s`);
            reply.edit(embed);
        });
        
        const proc = ffmpeg({ source: video.pipe(str) });

        const filePath:string = path.join('download', filename + '.mp3');
        proc.saveToFile(filePath);

        video.on('close', async () => {
            embed.setDescription('Download complete');
            reply.edit(embed);
            await message.channel.send({
                files: [ filePath ],
            });
            fs.unlinkSync(filePath);
        });
    });

}

const makeProgressBar = (percent:number, sections:number): string => {
    let progressBar:string = '';
    const secPercent:number = 100 / sections;
    const secAmount:number = Math.round(percent / secPercent);
    for (let i:number = 0; i < sections; i++) {
        if (i <= secAmount)
            progressBar += '█';
        else
            progressBar += '▒';
    }
    return progressBar;
}

bot.login(process.env.TOKEN);