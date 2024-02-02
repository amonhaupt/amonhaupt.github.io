var shown = false;

function show() {
    if(shown == false) {
        document.getElementById("digital_clock").style.display="block";
        shown = true;
    }
    else {
        document.getElementById("digital_clock").style.display="none";
        shown = false;
    }
}


var hour_handle_size = 2;
var minute_handle_size = 3;
var second_handle_size = 5;

function current_time() {
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    hour = update_time(hour);
    minute = update_time(minute);
    second = update_time(second);
    document.getElementById("digital_clock").innerHTML = hour + " : " + minute + " : " + second;

    var t = setTimeout(function(){ current_time() }, 1000);

    hour_rotation = 30 * hour + minute / 2;
    minute_rotation = 6 * minute;
    second_rotation = 6 * second;

    document.getElementById("hour").style.transform = `rotate(${hour_rotation}deg)`;
    document.getElementById("minute").style.transform = `rotate(${minute_rotation}deg)`;
    document.getElementById("second").style.transform = `rotate(${second_rotation}deg)`;

    create_handles(hour_rotation, hour, minute_rotation, minute, second_rotation, second);
}


function update_time(k) {
    if (k < 10) {
        return "0" + k;
    } 
    else {
        return k;
    }
}

function create_clock() {
    for (let i = 0; i < hour_handle_size; i++) {
        var hour_id = document.createElement("div");
        var hour_num = "hour_num" + i;
        hour_id.setAttribute("id", hour_num);
        document.getElementById("hour").appendChild(hour_id);
    }
    for (let i = 0; i < minute_handle_size; i++) {
        var minute_id = document.createElement("div");
        var minute_num = "minute_num" + i;
        minute_id.setAttribute("id", minute_num);
        document.getElementById("minute").appendChild(minute_id);
    }
    for (let i = 0; i < second_handle_size; i++) {
        var second_id = document.createElement("div");
        var second_num = "second_num" + i;
        second_id.setAttribute("id", second_num);
        document.getElementById("second").appendChild(second_id);
    }
}

function create_handles(hour_rotation, hour, minute_rotation, minute, second_rotation, second) {
    for (let i = 0; i < hour_handle_size; i++) {
        ID = "hour_num" + i;
        document.getElementById(ID).style.transform = `rotate(-${hour_rotation}deg)`;
        document.getElementById(ID).innerHTML = hour;

    }
    for (let i = 0; i < minute_handle_size; i++) {
        ID = "minute_num" + i;
        document.getElementById(ID).style.transform = `rotate(-${minute_rotation}deg)`;
        document.getElementById(ID).innerHTML = minute;

    }
    for (let i = 0; i < second_handle_size; i++) {
        ID = "second_num" + i;
        document.getElementById(ID).style.transform = `rotate(-${second_rotation}deg)`;
        document.getElementById(ID).innerHTML = second;

    }
}

create_clock();
current_time();


