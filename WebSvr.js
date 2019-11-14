//------------------------------------------------
//WebSvr.js
//  Web Server in node.js(can be dynamic.)
//------------------------------------------------


"use strict";

console.time('[WebSvr][Start]');

var libHttp = require('http');
var libUrl = require('url');
var libFs = require("fs");
var libPath = require("path");
var demo_three = require("./gl_demo/demo-three")();
var handlebars = require('handlebars');
const querystring = require('querystring');
var multiparty = require('multiparty');
let { inspect, promisify } = require('util');
let stat = promisify(libFs.stat);
let readdir = promisify(libFs.readdir);

function list() { //html list(file list)
    let tmpl = libFs.readFileSync(libPath.resolve("WebRoot", 'list.html'), 'utf8');
    return handlebars.compile(tmpl);
}

var funGetContentType = function (filePath) {
    var contentType = "";
    var ext = libPath.extname(filePath);
    switch (ext) {
        case ".html":
            contentType = "text/html";
            break;
        case ".js":
            contentType = "text/javascript";
            break;
        case ".css":
            contentType = "text/css";
            break;
        case ".gif":
            contentType = "image/gif";
            break;
        case ".jpg":
            contentType = "image/jpeg";
            break;
        case ".png":
            contentType = "image/png";
            break;
        case ".ico":
            contentType = "image/icon";
            break;
        default:
            contentType = "application/octet-stream";
    }
    console.log("Trying to visit file with ext:%s", ext);
    return contentType;
}

function wgl_handler(filepath, req, res) {
    console.log(filepath)
    console.log(demo_three)
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(demo_three);
    res.end();
}

function receiveClientData(req, res) {
    if (req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
        console.log("start to receive....");
        var fileName = "";
        var bodyForm = new multiparty.Form();
        bodyForm.uploadDir = "./WebRoot/cache";
        // console.log(bodyForm);
        console.log("begin body form...");
        console.log("headers=>", req.headers);
        bodyForm.parse(req, function (err, fields, files) {
            console.log("-----------------fiels--------------")
            console.log(fields);
            console.log("-----------------files--------------")
            console.log(files);
            console.log("-----------------saving files--------------")
            if(files){
                var files_obj = files["file"];
                if (files_obj) {
                    for (var i in files_obj) {
                        {
                            var file = files_obj[i];
                            libFs.rename(file.path, "./WebRoot/uploads/" + file.originalFilename, function (err) {
                                if (err) {
                                    console.log('rename error: ' + err);
                                } else {
                                    console.log('rename -'+file.originalFilename+'- ok');
                                }
                            });
                        }
                    }
                }
            }
        });
        bodyForm.on('close', () => {
            console.log('explain done.');
        })
        req.on('end', function () {
            console.log("request end");
        });
    } else {
        console.log("headers=>", req.headers);
        var info = '';
        req.addListener('data', function (chunk) {
            info += chunk;
        })
            .addListener('end', function () {
                console.log("body length is =>", info.length);
                info = querystring.parse(info);
                console.log("info=>", info);
            })
        res.end('other commit method.');
    }
}

class Server {
    constructor(argv) {
        this.list = list();
    }
    start(dynamicPageHanlder) {
        var _list = this.list;
        var webSvr = libHttp.createServer(async function (req, res) {
            var reqUrl = req.url;
            console.log("visit headers.user-agent =>", req.headers["user-agent"]);
            console.log("visit url=>%s", reqUrl);
            var pathName = libUrl.parse(reqUrl).pathname;
            var filePath = libPath.join("./WebRoot", pathName);
            if (pathName === '/favicon.ico') return res.end(); //网站图标
            console.log("visit path=>%s", pathName);
            if ("/show" == pathName) {
                filePath = "./WebRoot/dynamic.php";
            }
            else if ("/vv" == pathName) {
                filePath = "./WebRoot/tiamo/index.html";
            }
            else if ("/upload" == pathName) {
                console.log("upload request");
                receiveClientData(req, res);
                return;
            }
            //page type
            if (".php" == libPath.extname(filePath)) {
                //fake dynamic web page.
                console.log(filePath);
                if (dynamicPageHanlder)
                    dynamicPageHanlder(req, res);
            }
            else if (".wgl" == libPath.extname(filePath, req, res)) {
                wgl_handler(filePath, req, res)
            }
            else {
                try {
                    let statObj = await stat(filePath);
                    if (statObj.isDirectory()) {
                        console.log("visit a directory.");
                        let files = await readdir(filePath); //filenames.
                        files = files.map(file => ({
                            name: file,
                            url: libPath.join(pathName, file) //  /images,/index.css,/index.html
                        }));
                        let html = _list({
                            title: pathName,
                            files
                        });
                        res.setHeader('Content-Type', 'text/html');
                        res.end(html);
                    }
                    else {
                        //static web contents.
                        console.log("visit a stream object.");
                        libFs.exists(filePath, function (exists) {
                            if (exists) {
                                res.writeHead(200, { "Content-Type": funGetContentType(filePath) });
                                var stream = libFs.createReadStream(filePath, { flags: "r", encoding: null });
                                stream.on("error", function () {
                                    res.writeHead(404);
                                    res.end("<h1>404 Read Error</h1>");
                                });
                                stream.pipe(res);
                            }
                            else {
                                res.writeHead(404, { "Content-Type": "text/html" });
                                res.end("<h1>404 Not Found</h1>");
                            }
                        });
                    }
                }
                catch (e) {
                    console.log(inspect(e)); //inspect把一个toString后的对象仍然能展开显示
                }
            }
        });
        webSvr.on("error", function (error) {
            console.log(error);
        });
        webSvr.listen(80, function () {
            console.log('[WebSvr][Start] running at http://127.0.0.1:80/');
            console.timeEnd('[WebSvr][Start]');
        });
    }
}

module.exports = Server;