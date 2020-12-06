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
    .setTitle('Downloading');
    const reply:Message = await message.channel.send(embed);
    const video: Youtubedl = youtubedl(url, [], { cwd: __dirname });

    video.on('info', (info) => {
        const filename:string = info._filename.replace('.mp4', '');
        
        const str = progress({
            length: info.size,
            time: 500,
        });
    
        str.on('progress', (prog) => {
            embed.setTitle('Downloaded ' + Math.round(prog.percentage) + ' %')
            reply.edit(embed);
        });
        
        const proc = ffmpeg({ source: video.pipe(str) });

        const filePath:string = path.join('download', filename + '.mp3')
        proc.saveToFile(filePath);

        video.on('close', async () => {
            reply.delete();
            await message.channel.send({
                files: [ filePath ],
            });
            fs.unlinkSync(filePath);
        });
    });

}

bot.login(process.env.TOKEN);