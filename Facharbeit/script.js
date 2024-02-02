// ZIFFERNERKENNUNG

var previous = "home"
var previous_link = "link1"
function show(shown, link) {
    if (shown == previous) {
        return false;
    } else {
        document.getElementById(shown).style.display="block";
        document.getElementById(link).classList.add("active");
        document.getElementById(previous).style.display="none";
        document.getElementById(previous_link).classList.remove("active");
        previous = shown
        previous_link = link
        return false;
    }
}

//https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
//https://developer.mozilla.org/en-US/docs/Web/API/Path2D
//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
//https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

var canvas = document.getElementById("drawing_canvas");
var context = canvas.getContext("2d");
document.addEventListener("DOMContentLoaded", function() {
    var mouse_pos = { x: 0, y: 0 };
    var touch_pos = { x: 0, y: 0};
    let is_drawing = false;
    
    var line_width = 20;

    function resize_canvas() {
        if (window.innerHeight > window.innerWidth) {
            canvas.height = window.innerWidth/2;
            canvas.width = window.innerWidth/2; //elif window.innerwidth > x == width/3
        } else {
            canvas.height = window.innerHeight/3;
            canvas.width = window.innerHeight/3;
        }
        draw(canvas);
    }
    resize_canvas();

    canvas.addEventListener("mousedown", start_drawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop_drawing);
    canvas.addEventListener("mouseout", stop_drawing);

    canvas.addEventListener("touchstart", start_touch_drawing);
    canvas.addEventListener("touchmove", touch_draw);
    canvas.addEventListener("touchend", stop_touch_drawing);

    function get_position(e) {
        mouse_pos.x = e.clientX - canvas.getBoundingClientRect().left;
        mouse_pos.y = e.clientY - canvas.getBoundingClientRect().top;
    }

    function start_drawing(e) {
        is_drawing = true;
        get_position(e);
        draw(e);
    }

    function draw(e) {
        if (!is_drawing) return;

        if (is_drawing) {
            context.beginPath();
            context.lineWidth = line_width;
            context.lineCap = "round";
            context.strokeStyle = "rgb(233, 0, 0)";
            context.moveTo(mouse_pos.x, mouse_pos.y);
            get_position(e);
            context.lineTo(mouse_pos.x, mouse_pos.y);
            context.stroke();                    
        }
    }

    function stop_drawing() {
        is_drawing = false;
        context.closePath();
        predict();
    }
    
    function get_touch_position(e) {
        touch_pos.x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        touch_pos.y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
    }

    function start_touch_drawing(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
        is_drawing = true;
        get_touch_position(e);
        touch_draw(e);
    }

    function touch_draw(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
        if (!is_drawing) return;

        if (is_drawing) {
            context.beginPath();
            context.lineWidth = line_width;
            context.lineCap = "round";
            context.strokeStyle = "rgb(233, 0, 0)";
            context.moveTo(touch_pos.x, touch_pos.y);
            get_touch_position(e);
            context.lineTo(touch_pos.x, touch_pos.y);
            context.stroke();                    
        }
    }

    function stop_touch_drawing(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
        is_drawing = false;
        context.closePath();
        predict();
    }
});
function delete_canvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

async function loadModel() {
    model = undefined; 
    model = await tf.loadGraphModel("models/model.json");
}
loadModel();

async function predict() {
    var input_canvas = document.createElement("canvas");
    input_canvas.width = 28;
    input_canvas.height = 28;
    var input_context = input_canvas.getContext("2d");
    input_context.filter = "grayscale(1)"
    input_context.drawImage(canvas, 0, 0, 28, 28);
    const imageData = input_context.getImageData(0, 0, 28, 28);
    const data = imageData.data;
    var input_array = [];

    for(var i =0; i < data.length; i += 4) {
        input_array.push(data[i] / 255);
    }
    console.log(input_array);
    model.predict([tf.tensor(input_array).reshape([1,28,28,1])]).array().then(function(scores) {
        scores = scores[0];
        predicted = scores.indexOf(Math.max(...scores));
        console.log(predicted);
        document.getElementById("prediction_label").textContent=predicted;
    });
}


// TIC-TAC-TOE

const cells = document.querySelectorAll(".cell");
const status_text = document.getElementById("status_text");
const restart_button = document.getElementById("restart_button");
const win_conditons = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let legal_moves = ["", "", "", "", "", "", "", "", ""];
let current_player = "X";
let running = false;

start_game();

function start_game() {
    cells.forEach(cell => cell.addEventListener("click", cell_clicked));
    restart_button.addEventListener("click", restart_game);
    status_text.textContent = `${current_player} ist dran`;
    running = true;
}

function cell_clicked() {
    const cellIndex = this.getAttribute("cell_index");

    if(legal_moves[cellIndex] != "" || !running) {
        return;
    }
    if(current_player == "O") {
        return;
    }
    update_cell(this, cellIndex);
    check_for_winner();
}

function update_cell(cell, index) {
    legal_moves[index] = current_player;
    cell.textContent = current_player;

}

function change_player() {
    current_player = (current_player == "X") ? "O" : "X";
    if(current_player == "O") {
        setTimeout(make_ai_move, 500);
    }
    status_text.textContent = `${current_player} ist dran`;
}

function make_ai_move() {
    let move = Math.floor(Math.random() * 9);
    let ai_cell = document.getElementById("cell" + move);
    if(legal_moves[move] != "") {
        make_ai_move();
    }
    else {
        legal_moves[move] = current_player;
        ai_cell.textContent = current_player;
        check_for_winner();
    }
}

function check_for_winner() {
    let round_won = false;
    for(let i = 0; i < win_conditons.length; i++) {
        const condition = win_conditons[i];
        const cellA = legal_moves[condition[0]];
        const cellB = legal_moves[condition[1]];
        const cellC = legal_moves[condition[2]];

        if(cellA == "" || cellB == "" || cellC == "") {
            continue;
        }
        if(cellA == cellB && cellB == cellC) {
            round_won = true;
            break;
        }
    }
    if(round_won) {
        status_text.textContent = `${current_player} hat gewonnen!`;
        running = false;
    }
    else if(!legal_moves.includes("")) {
        status_text.textContent = `Unentschieden!`;
        running = false;
    }
    else {
        change_player();
    }
}

function restart_game() {
    current_player = "X";
    legal_moves = ["", "", "", "", "", "", "", "", ""];
    status_text.textContent = `${current_player} ist dran`;
    cells.forEach(cell => cell.textContent = "");
    running = true;
}