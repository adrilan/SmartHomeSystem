var socket = io.connect(window.location.host);   
var dataTemp = [];
var dataHumd = [];
var time = new Date();
var updateInterval = 2000; 

var Chart = new CanvasJS.Chart("ChartContainer", {
    zoomEnabled: true, 
    title: {
        text: "Temperature & Humidity" 
    },
    toolTip: { // Display temperature & Humidity at the same time
        shared: false
    },
    axisX: {
        title: "chart updates every 2 secs" // Description for X axis
    },
    data: [{
        type: "line", 
        xValueType: "dateTime", 
        showInLegend: true, 
        name: "temp",
        dataPoints: dataTemp
    },
    {
        type: "line",
        xValueType: "dateTime",
        showInLegend: true,
        name: "humd",
        dataPoints: dataHumd
    }
    ],
});

socket.on('update_data', function(data) {
    console.log(data.temp + ' ' + data.humd);
    dataTemp.push({
        x: time.getTime(),
        y: parseInt(data.temp)
    });

    dataHumd.push({
        x: time.getTime(),
        y: parseInt(data.humd)
    });
    Chart.render();
});

setInterval(function() {
    time.setTime(time.getTime() + updateInterval);
}, updateInterval);

socket.on('get_data', function(data) {
    console.log(data.message);
});
