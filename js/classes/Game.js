class Game {
    #field;
    #size;
    #cells;
    #rowCount;
    #levels;
    #level;
    #emptyCell;
    #newGameBtn;

    constructor(field) {
        this.#field = field;
        this.#newGameBtn = document.getElementById('new-game-btn');
        this.#levels = {
            easy: {
                count: 9,
                class: 'easy'
            },
            classic: {
                count: 16,
                class: 'classic'
            },
            medium: {
                count: 25,
                class: 'medium'
            },
            hard: {
                count: 36,
                class: 'hard'
            },
            expert: {
                count: 49,
                class: 'expert'
            },
            extreme: {
                count: 64,
                class: 'extreme'
            }
        };
    }

    static showScreen(screen) {
        document.getElementById('screen-box').style.left = `${screen * -100}%`;
    }

    start(level, fieldWidth) {
        this.#level = this.#levels[level] ?? this.#levels['classic'];
        this.#rowCount = Math.sqrt(this.#level.count)
        this.#size = Math.floor(fieldWidth / this.#rowCount);
        this.#field.parentElement.className = `game__zone ${this.#level.class}`;
        const cells = this.#getCells();
        this.#setPosition(cells);

        this.#field.onclick = event => this.#move(event.target);

        this.#newGameBtn.onclick = () => Game.showScreen(1);
    }

    redraw(fieldWidth) {
        if (!this.#cells) return;

        const oldSize = this.#size;
        this.#size = Math.floor(fieldWidth / this.#rowCount);
        const cells = [];

        this.#cells.forEach(cell => {
            const oldRow = cell.top / oldSize;
            const oldColumn = cell.left / oldSize;
            cell.top = oldRow * this.#size;
            cell.left = oldColumn * this.#size;
            cell.link.style.top = `${cell.top}px`;
            cell.link.style.left = `${cell.left}px`;
            cells.push(cell);
        });

        const emptyRow = this.#emptyCell.top / oldSize;
        const emptyColumn = this.#emptyCell.left / oldSize;
        this.#emptyCell.top = emptyRow * this.#size;
        this.#emptyCell.left = emptyColumn * this.#size;

        this.#cells = cells;
    }

    #getCells() {
        let numbers = Array.from(Array(this.#level.count).keys());
        const cells = [];

        do {
            numbers = this.#shuffle(numbers);
        } while (!this.#isSolvable(numbers));

        numbers.forEach(number => {
            const cell = document.createElement('button');
            cell.type = 'button';

            if (number === this.#level.count - 1) {
                cell.textContent = '';
                cell.className = 'game-cell empty';
            } else {
                cell.textContent = ++number;
                cell.className = 'game-cell';
            }

            cells.push(cell);
        });

        return cells;
    }

    #shuffle(cells) {
        for (let i = cells.length - 1; i > 0; i--) {
            const index = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[index]] = [cells[index], cells[i]];
        }

        return cells;
    }

    #isSolvable(cells) {
        const emptyRow = Math.floor(cells.indexOf(this.#level.count - 1) / this.#rowCount) + 1;

        const emptyIndex = cells.indexOf(this.#level.count - 1);
        const newCells = cells.slice();
        newCells.splice(emptyIndex, 1);

        let count = 0;

        for (let i = 0; i < newCells.length; i++) {
            for (let j = i; j < newCells.length; j++) {
                if (newCells[i] > newCells[j]) count++;
            }
        }

        if (this.#level.count % 2 === 0) {
            return (count + emptyRow) % 2 === 0 ? true : false;
        } else {
            return count % 2 === 0 ? true : false;
        }
    }

    #setPosition(cells) {
        this.#field.innerHTML = '';
        const cellsPosition = [];

        cells.forEach((cell, i) => {
            const column = i % this.#rowCount;
            const row = (i - column) / this.#rowCount;
            const top = row * this.#size;
            const left = column * this.#size;
            cell.style.top = `${top}px`;
            cell.style.left = `${left}px`;

            if (cell.classList.contains('empty')) {
                this.#emptyCell = {
                    top: top,
                    left: left
                };
            } else {
                cellsPosition.push({
                    top: top,
                    left: left,
                    value: Number(cell.textContent),
                    link: cell
                });
            }
            this.#field.append(cell);
        });

        this.#cells = cellsPosition;
    }

    #move(cell) {
        if (cell.classList.contains('empty')) return;

        const left = cell.offsetLeft;
        const top = cell.offsetTop;

        this.#checkCells(top, left);

        if (this.#checkWin()) this.#field.parentElement.classList.add('win');
    }

    #checkCells(top, left) {
        const leftDiff = this.#emptyCell.left - left;
        const topDiff = this.#emptyCell.top - top;
        const newPosition = {
            top: null,
            left: null
        };

        if (leftDiff !== 0 && topDiff !== 0) {
            return false;
        } else if (leftDiff === 0) {

            if (Math.abs(topDiff) !== this.#size) {
                const newTop = (topDiff > 0) ? top + this.#size : top - this.#size;
                this.#checkCells(newTop, left);
                newPosition.top = newTop;
            } else {
                newPosition.top = top + topDiff;
            }

            newPosition.left = left;

        } else if (topDiff === 0) {

            if (Math.abs(leftDiff) !== this.#size) {
                const newLeft = (leftDiff > 0) ? left + this.#size : left - this.#size;
                this.#checkCells(top, newLeft);
                newPosition.left = newLeft;
            } else {
                newPosition.left = left + leftDiff;
            }

            newPosition.top = top;
        }

        const index = this.#cells.findIndex(cell => cell.top === top && cell.left === left);
        const cell = this.#cells[index];

        this.#emptyCell.top = top;
        this.#emptyCell.left = left;
        cell.top = newPosition.top;
        cell.left = newPosition.left;
        cell.link.style.top = `${cell.top}px`;
        cell.link.style.left = `${cell.left}px`;
    }

    #checkWin() {
        let result = this.#cells.every(cell => (cell.value - 1) === this.#getPosition(cell));

        if (result === false) {
            result = this.#cells.every(cell => cell.value === this.#getPosition(cell));
        }

        return result;
    }

    #getPosition(cell) {
        const column = cell.left / this.#size;
        const row = cell.top / this.#size;

        return row * this.#rowCount + column;
    }
}
