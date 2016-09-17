/// <reference path="../typings/index.d.ts" />
export default class Push7 {
    private request;
    constructor(private app_no, private api_key) {
        this.request = require('request');
    }

    push(title, body, icon, url) {
        let options = {
            uri: 'https://api.push7.jp/api/v1/' + this.app_no + '/send',
            headers: {
                "Content-type": "application/json",
            },
            json: {
                "title": title,
                "body": body, 
                "icon": icon,
                "url": url,
                "apikey": this.api_key
            }
        };
        this.request.post(options, (error, response, body) => {
            if (error === null) {
                console.log(new Date() + ' : push success.');
                console.log(JSON.stringify(options));
            } else {
                console.log('error:' + error);
                console.log('response:' + response);
                console.log('body:' + body);
            }
        });
    }
};
