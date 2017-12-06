// Import modules from npm
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); 
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var pusher = require('./app/pusher');
var ping = require('ping');
var request = require('request');
const apiKey = 'cbe56f9c535a28529109ed952ba49a9a';
var url = require('url');
var querystring = require('querystring');


// Config database and authentication
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);


// Middleware  
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'anystringoftext',
                saveUninitialized: true,
                resave: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// Config routes
app.set('view engine', 'ejs');
require('./app/routes.js')(app, passport);



// Config devices states
var iotStates = [];
for (var i = 0; i < 5; i++) {
    iotStates.push(false);
} 

var DEVICES = {
    ESP32: 1,
    ESP8266: 2,
    BROWSER: 3
};

// [ESP8266, ESP32-1, ESP32-2,...]
var check_iot_device = function(deviceName) {
    if (deviceName.indexOf('ESP32') != -1) {
        return DEVICES.ESP32;
    } else if (deviceName.indexOf('ESP8266') != -1) {
        return DEVICES.ESP8266;     
    }
    return DEVICES.BROWSER;
}

var get_ip = function(deviceName) {
    return deviceName.substring(deviceName.indexOf('!') + 1, deviceName.length);
}


// ---------WEATHER FORECAST----------
function getCurrentWeather(weather) {
  return weather.list[0];
}

function moveServoToCondition(weather) {
  const description = weather.weather[0].description;
  console.log(weather.weather[0]);
  const angle = mapConditionToAngle(description);
  console.log('Condition is', description, 'angle is', angle);
  return weather;
}

function mapConditionToAngle(condition) {
  switch (condition) {
    case 'clear sky':
    case 'sky is clear':
    return 160;
    case 'shower rain':
    case 'light rain':
    return 85;
    case 'rain':
    case 'moderate rain':
    return 105;
    case 'scattered clouds':
    case 'few clouds':
    return 115;
    case 'broken clouds':
    return 135;
    case 'thunderstorm':
    return 150;
  }
}


io.on('connection', function(socket) {
    socket.on('connection', function(data) {
        console.log(data.message);
        var deviceName = data.message;
        var deviceType = check_iot_device(deviceName);

        if (deviceType == DEVICES.ESP32 || deviceType == DEVICES.ESP8266) {
            var index = deviceName.substring(0, 3);
            var ipAddress = get_ip(deviceName);

            switch(deviceType) {
                case DEVICES.ESP32: {
                    pusher.pushNotification('IoT Home - Devices', index + ' ESP32 connected!');
                    iotStates[parseInt(index[0])] = ipAddress;
                    break;
                }
                case DEVICES.ESP8266: {
                    pusher.pushNotification('IoT Home - Devices', index + ' ESP8266 connected!');
                    iotStates[0] = ipAddress;
                    break;
                }
            }
            socket.broadcast.emit('devices', {data: iotStates});
        } else {
            console.log(data.message);
            socket.emit('devices', {data: iotStates});
        }
    });

    socket.on('disconnect', function() {
        for (var i = 0; i < iotStates.length; ++i) {
            if (iotStates[i] != false) {
                var host = iotStates[i];
                var index = i;
                ping.sys.probe(host, function(alive) {
                    if (!alive) {
                        iotStates[index] = false;
                        // console.log(iotStates);
                        pusher.pushNotification('IoT Home - Devices', 'ESP disconnected!');
                        socket.broadcast.emit('devices', {data: iotStates});
                    }
                });
            }
        }
    });

    socket.on('hex', function(data) {
        io.sockets.emit('hex', { message: data});
        console.log(data);
    });

    socket.on('led', function(data) {
        io.sockets.emit('led', { message: data});
        console.log(data);
    });

    socket.on('OPEN',function(status){  
        console.log("DOOR OPEN",status);
    });

    socket.on('doorLock', function(data) {
        console.log(data.message);
        io.sockets.emit('doorLock', data.message);
    })

    socket.on('search-weather', (data) => {
    const weatherURL = 'http://api.openweathermap.org/data/2.5/forecast?' 
        + 'q=' 
        + encodeURIComponent(data.city) 
        + '&mode=json&units=metric&appid=' + apiKey;
        request(weatherURL, function (error, response, body) {
          if (!error && response.statusCode == 200) {
           var jsonWeather = JSON.parse(body);
           var currentWeather = getCurrentWeather(jsonWeather);

           var displayWeather = currentWeather.weather[0].description;

           var json = {
             "weather": [displayWeather],
             "city": [data.city]
           }
           io.sockets.emit('weather-indication', json);
           console.log(displayWeather);
         }
        });
    });

    socket.on('switch1', function(data) {
        var json = {
            "switch1": [data]
        }
        io.sockets.emit('switch1', json);
    });

    socket.on('switch2', function(data) {
        var json = {
            "switch2": [data]
        }
        io.sockets.emit('switch2', json);
    });

    socket.on('switch3', function(data) {
        var json = {
            "switch3": [data]
        }
        io.sockets.emit('switch3', json);
    });

    app.get('/get_data', function(req, res) {
        io.sockets.emit('get_data', {message: 'GET request'});
    });
    
    app.get('/update', function(req, res) {
        var uriData = url.parse(req.url);
        var pathName = uriData.pathname; //   /update
        var query = uriData.query;       //   temp=30&humd=40
        var queryData = querystring.parse(query);

        // var newData = {
        //     temp: queryData.temp,
        //     humd: queryData.humd,
        //     time: new Date()
        // };
        // res.end();

        // console.log(newData);
        io.sockets.emit('update_data', {temp: queryData.temp, humd: queryData.humd});
    });

});

var port = process.env.PORT || 3000;
http.listen(3000, function(req, res) {
    console.log(`Server listening on port: http://localhost:${port}`);
});

// app.listen(PORT);                                       
// console.log ("Server Connected ON: http://localhost:" + PORT);