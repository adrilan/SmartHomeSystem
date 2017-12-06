var pushpad = require('pushpad');

var AUTH_TOKEN = 'bb8bc090c09f067a6494e818052f548f';
var PROJECT_ID = 4713;


var project = new pushpad.Pushpad({
  authToken: AUTH_TOKEN,
  projectId: PROJECT_ID
});


module.exports = {
    pushNotification: function(title, message) {
        var notification = new pushpad.Notification({
          project: project, 
          body: message,//'ESP32 connected successfully!', 
          title: title, //'IoT Home - Devices', 
          targetUrl: 'http://google.com', 
          ttl: 2, 
          requireInteraction: false
        });
        notification.broadcast(function(err, result) { /*...*/ });
    }
}