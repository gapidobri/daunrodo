"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var youtube_dl_1 = __importDefault(require("youtube-dl"));
var progress_stream_1 = __importDefault(require("progress-stream"));
var fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var config_json_1 = __importDefault(require("./config.json"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var bot = new discord_js_1.Client();
bot.on('ready', function () {
    console.log('Bot is online');
});
bot.on('message', function (msg) {
    var message = msg.content.trim();
    var prefix = message.split('')[0];
    var command = message.split(' ')[0].substring(1);
    var args = message.split(' ');
    args.shift();
    if (prefix != config_json_1.default.prefix)
        return;
    switch (command) {
        case 'dl':
            download(msg, args[0]);
            break;
    }
});
var download = function (message, url) { return __awaiter(void 0, void 0, void 0, function () {
    var embed, reply, video;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                embed = new discord_js_1.MessageEmbed()
                    .setTitle('Downloading');
                return [4 /*yield*/, message.channel.send(embed)];
            case 1:
                reply = _a.sent();
                video = youtube_dl_1.default(url, [], { cwd: __dirname });
                video.on('info', function (info) {
                    var filename = info._filename.replace('.mp4', '');
                    var str = progress_stream_1.default({
                        length: info.size,
                        time: 500,
                    });
                    str.on('progress', function (prog) {
                        embed.setTitle('Downloaded ' + Math.round(prog.percentage) + ' %');
                        reply.edit(embed);
                    });
                    var proc = fluent_ffmpeg_1.default({ source: video.pipe(str) });
                    var filePath = path_1.default.join('download', filename + '.mp3');
                    proc.saveToFile(filePath);
                    video.on('close', function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reply.delete();
                                    return [4 /*yield*/, message.channel.send({
                                            files: [filePath],
                                        })];
                                case 1:
                                    _a.sent();
                                    fs_1.default.unlinkSync(filePath);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                return [2 /*return*/];
        }
    });
}); };
bot.login(process.env.TOKEN);
