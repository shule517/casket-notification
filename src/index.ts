/// <reference path="../typings/index.d.ts" />
import Watcher from './watcher';
import Push7 from './Push7';
try { require("source-map-support").install(); } catch (e) { /* empty */ }

const app_no = 'e06fe4202348419eab837e2c092a0351';
const api_key = 'd2df831e7ba242cfb5b46161242a6a95';

let api = new Push7(app_no, api_key);

// TEST 通知
//api.push(title, body, icon, url);

let client = require('cheerio-httpcli');
let fs = require('fs');

let circles = [];
// サークルカタログ取得
client.fetch('http://peercasket.herokuapp.com/2016a/catalog', { q: 'node.js' }, function (err, $, res) {
    console.log('----------------------------------');
    console.log(new Date());

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
        let circleInfo = {
            channelName: $(this).find('h4 a').text(),
            updateTime: updateTime,
            circlePageUrl: $(this).find('.circle-col-cut a').attr('href'),
            circlrImageUrl: $(this).find('.circle-col-cut img').attr('src'),
            comment: $(this).find('pre').text()
        };
        circles.push(circleInfo);

        console.log('channelName:' + circleInfo.channelName);
        console.log('updateTime:' + circleInfo.updateTime);
        console.log('circlePageUrl:' + circleInfo.circlePageUrl);
        console.log('circlrImageUrl:' + circleInfo.circlrImageUrl);
        console.log('comment:' + circleInfo.comment);
    });

    // WebPush
    let circle = circles[0];
    let title = "きゃすけっと速報";
    let body = "【" + circle.channelName + "】\nサークルが更新されました！";
    let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
    let url = circle.circlePageUrl;
    api.push(title, body, icon, url);

    // サークル情報をファイル保存
    fs.writeFile('circles.json', JSON.stringify(circles, null, '    '));
});

// let CronJob = require('cron').CronJob;
// let startJob = (time, action) => new CronJob({
//     cronTime: time,
//     onTick: function() {
//         action();
//     },
//     start: true
// });

// // ５分おきにサークル更新チェック
// startJob("*/5 * * * *", () => api.push(title, body, icon, url));
// // ３日目はじまった
// startJob("0 0 19 * *", () => console.log("あっという間にきゃすけっと最終日です。悔いが残らないように楽しんでいきましょう！"));
// // きゃすけっと終了まで＠３０分
// startJob("30 23 19 * *", () => console.log("きゃすけっと 残り３０分です！ まだサークル登録間に合いますよ！"));
// // きゃすけっと終了
// startJob("0 0 20 * *", () => console.log("きゃすけっと しゅーりょー！ お疲れさまでした！ 2017年春もおたのしみに"));
