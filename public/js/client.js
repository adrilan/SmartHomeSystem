var socket = io.connect(window.location.host);   
var iotStates = [];
var houseElement = $('.house');
$('#light-bulb').hide(); 


socket.emit('connection', {message: 'Browser connected'});
socket.on('devices', function(value) {
    // console.log(data);
    iotStates = value.data;
    console.log(iotStates); 
    
    for (var i = 0; i < iotStates.length; ++i) {
        if (iotStates[i] != false) {
            $("#devices div:nth-child("+ (i+1) +")").css("opacity", 1);
        } else {
            $("#devices div:nth-child("+ (i+1) +")").css("opacity", 0.5);
        }
    };
});


var setHouseColor = function(color) {
    houseElement.css('color', color);
}

var emitNewValue = function(value) {
    socket.emit('hex', value);
}

$('#picker').colpick({
    layout: 'RGB',
    onSubmit: function(hsb, hex, rgb, el) {
        $(el).colpickHide();
    },
    onChange: function(hsb, hex, rgb, el, bySetColor) {
        $('.house').css('color', '#' + hex);
        emitNewValue(hex);
    }
});

var ledColor = '#363636';

$('#led').click(function() {
    if (ledColor === '#FFEB3B') {
        $(this).css('color', '#363636');
        ledColor = '#363636';
    } else {
        $(this).css('color', '#FFEB3B');
        ledColor = '#FFEB3B';
    }
});


$('select').change(function() {
    var option = $('#light').val();
    if (option === 'bulb') {
        $('#mood-light').hide();
        $('#light-bulb').show();
    } else {
        $('#mood-light').show();
        $('#light-bulb').hide();
    }
});

$('#switch1').click(function() {
    if ($('#switch1').is(':checked')) {
        socket.emit('switch1', 1);
    } else {
        socket.emit('switch1', 0);
    }
});

$('#switch2').click(function() {
    if ($('#switch2').is(':checked')) {
        socket.emit('switch2', 1);
    } else {
        socket.emit('switch2', 0);
    }
});

$('#switch3').click(function() {
    if ($('#switch3').is(':checked')) {
        socket.emit('switch3', 1);
    } else {
        socket.emit('switch3', 0);
    }
});

var weatherInput = $('#pac-input');
weatherInput.change((function(e) {
    var value = e.target.value.trim();
    socket.emit('search-weather', {
      city: value
  });
}));

// function doorLock() {
//     var doors = [];
//     doors.push(($('#switch1').is(':checked')) ? 1 : 0);
//     doors.push(($('#switch2').is(':checked')) ? 1 : 0);
//     doors.push(($('#switch3').is(':checked')) ? 1 : 0);

//     socket.emit('doorLock', {message: doors});
// }

