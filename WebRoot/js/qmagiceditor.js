"use strict";
document.write("<script type='text/javascript' src='./js/qwebchannel.js'></script>");
 //BEGIN SETUP
 function output(message)
 {
     var output = document.getElementById("output");
     output.innerHTML = output.innerHTML + message + "\n";
 }
 window.onload = function() {
    if (location.search != "")
        var baseUrl = (/[?&]webChannelBaseUrl=([A-Za-z0-9\-:/\.]+)/.exec(location.search)[1]);
    else
        var baseUrl = "ws://localhost:54321";
     output("Connecting to WebSocket server at " + baseUrl + ".");
     var socket = new WebSocket(baseUrl);

     socket.onclose = function()
     {
         console.error("web channel closed");
     };
     socket.onerror = function(error)
     {
         console.error("web channel error: " + error);
     };
     socket.onopen = function()
     {
         output("WebSocket connected, setting up QWebChannel.");
         new QWebChannel(socket, function(channel) {
             // make dialog object accessible globally
             window.dialog = channel.objects.WebChannelWorker;

             document.getElementById("send").onclick = function() {
                 var input = document.getElementById("input");
                 var text = input.value;
                 if (!text) {
                     return;
                 }

                 output("Sent message: " + text);
                 input.value = "";
                 dialog.receiveText(text);
             }

             dialog.sendText.connect(function(message) {
                 output("Received message: " + message);
             });

             dialog.receiveText("Client connected, ready to send/receive messages!");
             output("Connected to WebChannel, ready to send/receive messages!");
         });
     }
 }
 //END SETUP