/// <reference path="../typings/index.d.ts" />
import Watcher from './watcher';
import Push7 from './push7';
import Circle from './circle';
import Channel from './channel';

try { require("source-map-support").install(); } catch (e) { /* empty */ }

const app_no = 'e06fe4202348419eab837e2c092a0351';
const api_key = 'd2df831e7ba242cfb5b46161242a6a95';

let api = new Push7(app_no, api_key);

// TEST 通知
//api.push(title, body, icon, url);

let client = require('cheerio-httpcli');
let fs = require('fs');

let watchCircle = () =>
{
    const jsonFilePath = 'circles.json';
    let circlesBak:Circle[] = [];
    try {
        circlesBak = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    } catch (x){
    }

    let circles:Circle[] = [];
    // サークルカタログ取得
    client.fetch('http://peercasket.herokuapp.com/2016a/catalog', { q: 'node.js' }, function (err, $, res) {
        console.log('----------------------------------');
        console.log(new Date());

        // サークル情報を取得
        $('article').each(function (index) {
            console.log(index + '----------------------------------');

            let updateTime = "";
            let text = $(this).find('.circle-col-desc').text();
            text.split('\n').forEach((line) => {
                let index = line.indexOf('更新:');
                if (index != -1) {
                    updateTime = line.substring(index + '更新:'.length);
                }
            });

            let circlePageUrl = $(this).find('.circle-col-cut a').attr('href');
            let lastIndex = circlePageUrl.lastIndexOf('/');
            let circleInfo = {
                circleId: circlePageUrl.substring(lastIndex+1),
                circleName: $(this).find('h4 a').text(),
                updateTime: updateTime,
                circlePageUrl: $(this).find('.circle-col-cut a').attr('href'),
                circlrImageUrl: $(this).find('.circle-col-cut img').attr('src'),
                comment: $(this).find('pre').text()
            };
            circles.push(circleInfo);

            console.log('channelName:' + circleInfo.circleName);
            console.log('updateTime:' + circleInfo.updateTime);
            console.log('circlePageUrl:' + circleInfo.circlePageUrl);
            console.log('circlrImageUrl:' + circleInfo.circlrImageUrl);
            console.log('comment:' + circleInfo.comment);
        });

        // サークル情報の更新チェック
        circles.forEach((circle) => {
            let exists = false;
            circlesBak.forEach((circleBak) => {
                if (circle.circleId == circleBak.circleId) {
                    exists = true;
                    // サークル更新された
                    if (circle.updateTime != circleBak.updateTime) {
                        // WebPush
                        console.log('Updated!:' + circle.circleName);
                        let title = "きゃすけっと速報";
                        let body = "【" + circle.circleName + "】 Update\nサークルが更新されました！";
                        let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
                        let url = circle.circlePageUrl;
                        api.push(title, body, icon, url);
                    }
                }
            });

            // サークルが追加された
            if (!exists) {
                // WebPush
                console.log('Added!:' + circle.circleName);
                let title = "きゃすけっと速報";
                let body = "【" + circle.circleName + "】 New\n新しいサークルが公開されました！";
                let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
                let url = circle.circlePageUrl;
                api.push(title, body, icon, url);
            }
        });

        // サークル情報をファイル保存
        fs.writeFile(jsonFilePath, JSON.stringify(circles, null, '    '));
    });
};

// チャンネル情報の取得
let watchChannel = () => {

    const jsonFilePath = 'channel.json';
    let channelsBak:Channel[] = [];
    try {
        channelsBak = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    } catch (x){
    }

    let channels:Channel[] = [];

    client.fetch('http://peercast.takami98.net/multi-yp/index.txt', { q: 'node.js' }, function (err, $, res) {
        let html = $.html();
        let lines = html.split("\n");
        lines.forEach((line) => {
            let elements = line.split("<>");
            let channelName = elements[0];
            let index = channelName.lastIndexOf('<');
            channelName = channelName.substr(0, index);
            let channelId = elements[1];
            let tip = elements[2];
            let contactUrl = elements[3];
            let genre = elements[4];
            let detail = elements[5];
            let relay = elements[6];
            let listener = elements[7];
            let bitrate = elements[8];
            let type = elements[9];
            let comment = elements[14];
            let time = elements[15];
            let channel = new Channel(channelName, channelId, tip, contactUrl, genre, detail, relay, listener, bitrate, type, comment, time);

            if (relay >= -1) {
                let target = (channel.channelName + channel.comment + channel.detail + channel.genre);
                let isCascket = (target.indexOf('きゃすけっと') != -1);
                if (isCascket) {
                    channels.push(channel);
                    console.log("きゃすけっと：" + channelName);
                }
            }
        });

        // チャンネル情報の配信開始チェック
        channels.forEach((channel) => {
            let exists = false;
            channelsBak.forEach((channelBak) => {
                if (channel.channelName == channelBak.channelName) {
                    exists = true;
                }
            });

            // 配信開始された！
            if (!exists) {
                // WebPush
                let title = "きゃすけっと速報";
                let body = "【" + channel.channelName + "】の配信がはじまりました！\n";
                if (channel.genre.length > 0) {
                    body += '[' + channel.genre + ']'
                }
                body += channel.detail;
                let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
                let url = channel.contactUrl;
                api.push(title, body, icon, url);
                console.log('---------');
                console.log(title);
                console.log(body);
                console.log(url);
            }
        });

        // チャンネル情報をファイル保存
        fs.writeFile(jsonFilePath, JSON.stringify(channels, null, '    '));
    });
};

// テスト実行
//watchChannel();
//watchCircle();

let CronJob = require('cron').CronJob;
let startJob = (time, action) => new CronJob({
    cronTime: time,
    onTick: function() {
        action();
    },
    start: true
});

// ５分おきにサークル更新チェック
startJob("*/5 * * * *", () => watchCircle());

// ５分おきに配信チェック
startJob("*/5 * * * *", () => watchChannel());

// ３日目はじまった
startJob("0 0 19 * *", () => {
    let title = "きゃすけっと速報";
    let body = "きゃすけっと三日目はじまりました！！\nあっという間に最終日です。\n悔いが残らないように楽しんでいきましょう！";
    let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
    let url = "http://peercasket.herokuapp.com/2016a/catalog";
    api.push(title, body, icon, url);
});
// きゃすけっと終了まで＠３０分
startJob("30 23 19 * *", () => {
    let title = "きゃすけっと速報";
    let body = "きゃすけっと終了まで残り３０分です！\n駆け込み勢のみなさん、まだあきらめないで！！";
    let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
    let url = "http://peercasket.herokuapp.com/2016a/catalog";
    api.push(title, body, icon, url);
});
// きゃすけっと終了
startJob("0 0 20 * *", () => {
    let title = "きゃすけっと速報";
    let body = "きゃすけっと しゅーりょー！！\nみなさん お疲れさまでした！\n2017年春もおたのしみに";
    let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
    let url = "http://peercasket.herokuapp.com/2016a/catalog";
    api.push(title, body, icon, url);
});
