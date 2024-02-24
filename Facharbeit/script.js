var previous = "home"
var previous_link = "link1"

function show(shown, link) { // Sorgt dafür dass die Aktive Seite rot markiert ist
    if (shown == previous) {
        return false;
    } else {
        document.getElementById(shown).style.display = "block";
        document.getElementById(link).classList.add("active");
        document.getElementById(previous).style.display = "none";
        document.getElementById(previous_link).classList.remove("active");
        previous = shown
        previous_link = link
        return false;
    }
}

// OBJEKTERKENNUNG
// Basiert auf folgenden Tutorial
// https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection/#0

const cam_section = document.getElementById("cam_section");
const startpage_section = document.getElementById("startpage");

var object_model = undefined;


function load_cocoSsd_model() { // Laden des KI-Modells
    document.getElementById("below").classList.add("removed");
    document.getElementById("still_loading").classList.remove("removed");
    cocoSsd.load().then(function (loadedModel) {
        object_model = loadedModel;
        cam_section.classList.remove("invisible");
        startpage_section.classList.remove("invisible");
        document.getElementById("still_loading").classList.add("removed");
        document.getElementById("load_model_button").classList.add("removed");
    });

}



const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");

function hasGetUserMedia() { // prüft ob eine Kamera vorhanden ist
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

var children = [];

if (hasGetUserMedia()) { // wenn eine Kamera vorhanden ist kann sie aktiviert werden
    const enable_webcam_button = document.getElementById("webcam_button");
    enable_webcam_button.addEventListener("click", enable_cam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

function enable_cam(event) { // Funktion aktiviert Kamera mit gegebenen vorgaben
    if (!object_model) {
        return;
    }

    event.target.classList.add("removed");

    video_box = window.innerWidth - 44;

    const constraints = {
        video: {
            facingMode: {
                exact: "environment" // Nutzt eine der vorhandenen Kameras auf der Hinterseite des Handys
            },
            width: video_box,
            height: video_box
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) { // Aktivierung der Kamera und starten der Vorhersagen
        video.srcObject = stream;
        video.addEventListener("loadeddata", predict_webcam);
    });
}

var english_words = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'];
var german_words = ['Person', 'Fahrrad', 'Auto', 'Motorrad', 'Flugzeug', 'Bus', 'Zug', 'LKW', 'Boot', 'Ampel', 'Feuerhydrant', 'Stoppschild', 'Parkuhr', 'Bank', 'Vogel', 'Katze', 'Hund', 'Pferd', 'Schaf', 'Kuh', 'Elefant', 'Bär', 'Zebra', 'Giraffe', 'Rucksack', 'Regenschirm', 'Handtasche', 'Krawatte', 'Koffer', 'Frisbeescheibe', 'Skier', 'Snowboard', 'Sportball', 'Drachen', 'Baseballschläger', 'Baseballhandschuh', 'Skateboard', 'Surfbrett', 'Tennisschläger', 'Flasche', 'Weinglas', 'Tasse', 'Gabel', 'Messer', 'Löffel', 'Schüssel', 'Banane', 'Apfel', 'Sandwich', 'orange', 'Brokkoli', 'Karotte', 'Hotdog', 'Pizza', 'Donut', 'Kuchen', 'Stuhl', 'Couch', 'Topfpflanze', 'Bett', 'Esstisch', 'Toilette', 'Fernseher', 'Laptop', 'Maus', 'Fernbedienung', 'Tastatur', 'Handy', 'Mikrowelle', 'Ofen', 'Toaster', 'Waschbecken', 'Kühlschrank', 'Buch', 'Uhr', 'Vase', 'Schere', 'Teddybär', 'Fön', 'Zahnbürste'];


function translate(input) { // Das vortrainierte KI-Modell gibt englische Begriffe aus, die Funktion übersetzt diese mit den Listen weiter Oben
    if (english_words.includes(input)) {
        var translated_word = german_words[english_words.indexOf(input)];
        return translated_word;
    } else {
        return input;
    }
}



function predict_webcam() {

    object_model.detect(video).then(function (predictions) {

        for (let i = 0; i < children.length; i++) { // entfernt Markierungen des vorherigen Frames
            liveView.removeChild(children[i]);
        }
        children.splice(0);

        for (let n = 0; n < predictions.length; n++) { // geht durch alle Vorhersagen und zeigt sie an wenn ...

            if (predictions[n].score > 0.66) { // ... zu mehr als 66% sicher
                const p = document.createElement("p");
                var translation = translate(predictions[n].class);
                p.innerText = translation + " - mit " +
                    Math.round(parseFloat(predictions[n].score) * 100) +
                    "% Sicherheit";

                p.style = "left: " + predictions[n].bbox[0] + "px;" + // Zeichnet die Box mit der Vorhersage
                    "top: " + predictions[n].bbox[1] + "px;" +
                    "width: " + (predictions[n].bbox[2] - 10) + "px;";

                const highlighter = document.createElement("div"); // Zeichnet die Markierung
                highlighter.setAttribute("class", "highlighter");
                highlighter.style = "left: " + predictions[n].bbox[0] + "px; top: " +
                    predictions[n].bbox[1] + "px; width: " +
                    predictions[n].bbox[2] + "px; height: " +
                    predictions[n].bbox[3] + "px;";

                liveView.appendChild(highlighter);
                liveView.appendChild(p);

                children.push(highlighter);
                children.push(p);
            }
        }

        window.requestAnimationFrame(predict_webcam);
    });
}

// ZIFFERNERKENNUNG
//Practical TensorFlow.js Deep Learning in Web App Development (Juan De Dios Santos Rivera) - ab Seite 114

var canvas = document.getElementById("drawing_canvas");
var context = canvas.getContext("2d");

document.addEventListener("DOMContentLoaded", function () {
    var mouse_pos = {
        x: 0,
        y: 0
    };
    var touch_pos = {
        x: 0,
        y: 0
    };
    let is_drawing = false;

    var line_width = 20;

    function resize_canvas() { // Passt den Canvas an die Bildschirm größe an
        if (window.innerHeight > window.innerWidth) {
            canvas.height = window.innerWidth / 2;
            canvas.width = window.innerWidth / 2;
        } else {
            canvas.height = window.innerHeight / 3;
            canvas.width = window.innerHeight / 3;
        }
        canvas.style.marginLeft = window.innerWidth / 2 - canvas.width + "px";
        document.getElementById("delete_button").style.marginLeft = window.innerWidth / 2 - canvas.width + "px";
        document.getElementById("prediction_text").style.marginLeft = window.innerWidth / 2 - canvas.width + "px";
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

    function get_position(e) { // gibt die aktuelle Maus Position relativ zum Canvas wieder
        mouse_pos.x = e.clientX - canvas.getBoundingClientRect().left;
        mouse_pos.y = e.clientY - canvas.getBoundingClientRect().top;
    }

    function start_drawing(e) { // startet das Zeichnen
        is_drawing = true;
        get_position(e);
        draw(e);
    }

    function draw(e) { // Hauptfunktion zum Zeichnen
        if (!is_drawing) return;

        if (is_drawing) {
            context.beginPath();
            context.lineWidth = line_width; // Linienstärke
            context.lineCap = "round"; // Linienart
            context.strokeStyle = "rgb(233, 0, 0)"; // Linienfarbe
            context.moveTo(mouse_pos.x, mouse_pos.y); // Startposition
            get_position(e); // aktuelle Position
            context.lineTo(mouse_pos.x, mouse_pos.y); // Zeichnet eine Linie von der Startposition zu aktuellen Position
            context.stroke(); // füllt die Linie mit Farbe
        }
    }

    function stop_drawing() { // wenn die Maustaste losgelassen wird stoppt das Zeichnen
        is_drawing = false;
        context.closePath();
        predict(); // startet die Vorhersage
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

function delete_canvas() { // überschreibt jeden Pixel mit Weißen
    context.clearRect(0, 0, canvas.width, canvas.height);
}

async function loadModel() { // lädt das KI-Modell
    digit_model = undefined;
    digit_model = await tf.loadGraphModel("models/model.json");
}
loadModel();

// Practical TensorFlow.js Deep Learning in Web App Development (Juan De Dios Santos Rivera) - Seite 116
async function predict() { // erstell eine Vorhersage anhand der Zeichnung im Canvas
    const to_predict = tf.browser.fromPixels(canvas).resizeBilinear([28, 28]).mean(2).expandDims().expandDims(3).toFloat().div(255.0);
    //resizeBiliniear([28, 28]) - Tensor zu 28x28 Pixel nötig da Modell nur Eingaben von 28x28 Pixeln erkennen kann
    //mean(2) - Macht das Bild Schwarz-Weiß
    //expandDims() - Umformt den Tensor zu [1, 28, 28, 1]
    //float() - wandelt die Werte in Kommazahlen um
    //div(255.0) - Teilt die Werte durch 255 um sie zu normalisieren (zwischen 0 und 1 - um Graustufen zu erzeugen)
    const prediction = digit_model.predict(to_predict).dataSync();
    document.getElementById("prediction_label").textContent = tf.argMax(prediction).dataSync(); // Vorhersage mit der höchsten Wahrscheinlichkeit
}


// TIC-TAC-TOE
// Tic-Tac-Toe Spiel: https://www.codebrainer.com/blog/tic-tac-toe-javascript-game (genutzt als Basis)
// Minimax Algorithmus: https://youtu.be/trKjYdBASyQ

const cells = document.querySelectorAll(".cell");
const status_text = document.getElementById("status_text");
const restart_button = document.getElementById("restart_button");
const win_conditons = [
    [0, 1, 2], // obere Reihe
    [3, 4, 5], // mittlere Reihe
    [6, 7, 8], // untere Reihe
    [0, 3, 6], // linke Spalte
    [1, 4, 7], // mittlere Spalte
    [2, 5, 8], // rechte Spalte
    [0, 4, 8], // Diagonale links
    [2, 4, 6] // Diagonale rechts
];

let legal_moves = ["", "", "", "", "", "", "", "", ""];
var current_legal_moves = legal_moves;
let human_player = "X";
let ai_player = "O";

let current_player = "X";
let running = false;

var difficulty = document.getElementById("difficulty_setting").value;

function select_difficulty(input) {
    difficulty = input;
}

start_game();

function start_game() {
    cells.forEach(cell => cell.addEventListener("click", cell_clicked));
    restart_button.addEventListener("click", restart_game);
    status_text.textContent = `${current_player} ist dran`;
    running = true;
}

function cell_clicked() {
    const cellIndex = this.getAttribute("cell_index");

    if (legal_moves[cellIndex] != "" || !running) {
        return;
    }
    if (current_player == ai_player) {
        return;
    }
    update_cell(this, cellIndex);
    check_for_winner();
}

function update_cell(cell, index) {
    legal_moves[index] = current_player;
    current_legal_moves = legal_moves;
    cell.textContent = current_player;

}

function change_player() {
    if (current_player == human_player) {
        current_player = ai_player
        if (current_player == "O") {
            if (difficulty == "easy") {
                setTimeout(make_easy_ai_move, 500);
            }
            if (difficulty == "medium") {
                setTimeout(make_medium_ai_move, 500);
            }
            if (difficulty == "hard") {
                setTimeout(make_hard_ai_move, 500);
            }

        }
    } else {
        current_player = human_player
    }
    status_text.textContent = `${current_player} ist dran`;
}

function check_for_winner() {
    let round_won = false;
    for (let i = 0; i < win_conditons.length; i++) {
        const condition = win_conditons[i]; // i = 0 -> [0, 1, 2] obere Reihe
        const cell_1 = legal_moves[condition[0]]; // cell_1 == 0
        const cell_2 = legal_moves[condition[1]]; // cell_2 == 1
        const cell_3 = legal_moves[condition[2]]; // cell_3 == 2

        if (cell_1 == "" || cell_2 == "" || cell_3 == "") { // (|| <- steht für oder)
            continue; // wenn eine Zelle oder mehrere leer sind neustarten mit i + 1 
        }
        if (cell_1 == cell_2 & cell_2 == cell_3) {
            round_won = true;
            break; // wenn alle Zellen 1 bis 3 gleich sind also z.B. X dann ist die Runde gewonnen
        }
    }
    if (round_won) {
        status_text.textContent = `${current_player} hat gewonnen!`;
        running = false;
    } else if (!legal_moves.includes("")) {
        status_text.textContent = `Unentschieden!`;
        running = false;
    } else {
        change_player();
    }
}

function restart_game() { // setzt alles auf Ausgangseinstellungen zurück
    current_player = "X";
    legal_moves = ["", "", "", "", "", "", "", "", ""];
    status_text.textContent = `${current_player} ist dran`;
    cells.forEach(cell => cell.textContent = "");
    running = true;
}

function make_easy_ai_move() {
    if (current_player == human_player) {
        return;
    } else {
        let move = worst_move();
        if (move == null) {
            status_text.textContent = `O gibt auf, X gewinnt!`;
            running = false;
        }
        let ai_cell = document.getElementById("cell" + move);
        legal_moves[move] = ai_player;
        current_legal_moves = legal_moves;
        ai_cell.textContent = ai_player;
        check_for_winner();
    }
}

function worst_move() {
    let best_score = -10;
    let move_to_make;
    for (let i = 0; i < 9; i++) {
        if (current_legal_moves[i] == "") {
            current_legal_moves[i] = ai_player;
            let move_score = minimax(current_legal_moves, 0, true);
            current_legal_moves[i] = "";
            if (move_score > best_score) {
                best_score = move_score;
                move_to_make = i;
            }
        }
    }
    return move_to_make;
}

function make_medium_ai_move() {
    let move = Math.floor(Math.random() * 9);
    let ai_cell = document.getElementById("cell" + move);
    if (legal_moves[move] != "") {
        make_medium_ai_move();
    } else {
        legal_moves[move] = current_player;
        ai_cell.textContent = current_player;
        check_for_winner();
    }
}

var move_scores = {
    X: 10,
    O: -10,
    tie: 0
};

function minimax(current_legal_moves, depth, is_maximizing) {
    let result = evaluate(current_legal_moves, is_maximizing);
    if (result !== null) {
        return move_scores[result];
    }
    if (is_maximizing) {
        let best_score = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (current_legal_moves[i] == "") {
                current_legal_moves[i] = human_player;
                let given_score = minimax(current_legal_moves, depth + 1, false);
                current_legal_moves[i] = "";
                best_score = Math.max(given_score, best_score);
            }
        }
        return best_score;
    } else {
        let best_score = +Infinity;
        for (let i = 0; i < 9; i++) {
            if (current_legal_moves[i] == "") {
                current_legal_moves[i] = ai_player;
                let given_score = minimax(current_legal_moves, depth + 1, true);
                current_legal_moves[i] = "";
                best_score = Math.min(given_score, best_score);
            }
        }
        return best_score;
    }
}

function evaluate(current_legal_moves, is_maximizing) {
    let round_won = false;
    for (let i = 0; i < win_conditons.length; i++) {
        const condition = win_conditons[i];
        const cell_1 = current_legal_moves[condition[0]];
        const cell_2 = current_legal_moves[condition[1]];
        const cell_3 = current_legal_moves[condition[2]];

        if (cell_1 == "" || cell_2 == "" || cell_3 == "") {
            continue;
        }
        if (cell_1 == cell_2 & cell_2 == cell_3) {
            round_won = true;
            break;
        }
    }
    if (is_maximizing) {
        var cp = ai_player;
    } else {
        cp = human_player;
    }
    if (round_won) {
        return cp;
    } else if (!current_legal_moves.includes("")) {
        return "tie";
    } else {
        return null;
    }
}


function best_move() {
    let best_score = +Infinity;
    let move_to_make;
    for (let i = 0; i < 9; i++) {
        if (current_legal_moves[i] == "") {
            current_legal_moves[i] = ai_player;
            let move_score = minimax(current_legal_moves, 0, true);
            current_legal_moves[i] = "";
            if (move_score < best_score) {
                best_score = move_score;
                move_to_make = i;
            }
        }
    }
    return move_to_make;
}

function make_hard_ai_move() {
    if (current_player == human_player) {
        return;
    } else {
        let move = best_move();
        let ai_cell = document.getElementById("cell" + move);
        legal_moves[move] = ai_player;
        current_legal_moves = legal_moves;
        ai_cell.textContent = ai_player;
        check_for_winner();
    }

}
