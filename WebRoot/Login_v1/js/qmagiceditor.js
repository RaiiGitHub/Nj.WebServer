"use strict";
document.write("<script type='text/javascript' src='./js/qwebchannel.js'></script>");
//BEGIN SETUP
function output(message) {
    console.log(message);
}

window.onload = function () {
    var baseUrl = "ws://localhost:54321";
    output("Connecting to WebSocket server at " + baseUrl + ".");
    var socket = new WebSocket(baseUrl);

    socket.onclose = function () {
        console.error("web channel closed");
    };
    socket.onerror = function (error) {
        console.error("web channel error: " + error);
    };
    socket.onopen = function () {
        output("WebSocket connected, setting up QWebChannel.");
        new QWebChannel(socket, function (channel) {
            // make dialog object accessible globally
            window.dialog = channel.objects.WebChannelWorker;
            if (location.search != ""){
                var uid = /[?&]email=([^&]+)/.exec(location.search)[1];
                if (!uid) {
                    return;
                }
                var result = "{\"response\":\"user.login\", \"account\":\"" + uid + "\",\"succeed\": true}";
                output(result);
                dialog.receiveText(result); 
            }
           
            dialog.sendText.connect(function (message) {
                output("Received message: " + message);
            });
            dialog.receiveText("Client connected, ready to send/receive messages!");
            output("Connected to WebChannel, ready to send/receive messages!");
        });
    }
}
 //END SETUP