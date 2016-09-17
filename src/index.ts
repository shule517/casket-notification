/// <reference path="../typings/index.d.ts" />
import Watcher from './watcher';
import Push7 from './Push7';
try { require("source-map-support").install(); } catch (e) { /* empty */ }

const app_no = 'e06fe4202348419eab837e2c092a0351';
const api_key = 'd2df831e7ba242cfb5b46161242a6a95';

let api = new Push7(app_no, api_key);

let title = "きゃすけっと速報";
let body = "【しっかりシュールｃｈ】\nサークルが更新されました！";
let icon = "https://dashboard.push7.jp/uploads/fd91a7fdc2a542688778db4d79d50b18.jpg";
let url = "http://peercasket.herokuapp.com/2016a/circle/2715"

// TEST 通知
//api.push(title, body, icon, url);

// ５分おきに実行
let CronJob = require('cron').CronJob;
let job = new CronJob({
    cronTime: "*/5 * * * *",
    onTick: function() {
        api.push(title, body, icon, url);
        console.log("5min!");
    },
    start: true
});
