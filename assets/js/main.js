'use strict';

const gameField = document.getElementById('game');
const gameStartBtn = document.getElementById('btn-start');
const levelBox = document.getElementById('level-box');

const game = new Game(gameField);
let fieldWidth = getFieldWidth();

window.onresize = () => {
    fieldWidth = getFieldWidth();
    game.redraw(fieldWidth);
}

gameStartBtn.onclick = () => Game.showScreen(1);

levelBox.onclick = event => {
    const btn = event.target;

    if (btn.localName === 'button') {
        game.start(btn.textContent.toLowerCase(), fieldWidth);
        Game.showScreen(2);
    }
}

function getFieldWidth() {
    if (window.screen.width < 768) {
        return 300;
    } else {
        if (window.screen.height < 520) {
            return 300;
        } else {
            return 450;
        }
    }
}
