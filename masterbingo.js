class BingoGame {
    constructor() {
        this.phrases = [];
        this.cards = [];
        this.marked = [];
        this.selectedPhrases = new Set();
        this.hasBingo = [];
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.phraseList = document.getElementById('phraseList');
        this.cardsContainer = document.getElementById('cardsContainer');
        this.loadPhrasesBtn = document.getElementById('loadPhrasesBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.modal = document.getElementById('phraseModal');
        this.phraseInput = document.getElementById('phraseInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
    }

    attachEventListeners() {
        this.loadPhrasesBtn.addEventListener('click', () => this.showPhraseModal());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.submitBtn.addEventListener('click', () => this.submitPhrases());
        this.cancelBtn.addEventListener('click', () => this.hidePhraseModal());
    }

    showPhraseModal() {
        this.modal.style.display = 'block';
    }

    hidePhraseModal() {
        this.modal.style.display = 'none';
    }

    submitPhrases() {
        const rawText = this.phraseInput.value.trim();
        const newPhrases = rawText.split('\n')
            .map(phrase => phrase.trim())
            .filter(phrase => phrase);

        if (newPhrases.length < 24) {
            alert('Need at least 24 phrases for a bingo card');
            return;
        }

        this.phrases = newPhrases;
        this.updatePhraseList();
        this.resetGame();
        this.hidePhraseModal();
    }

    createBingoCard() {
        if (this.phrases.length < 24) {
            throw new Error('Need at least 24 phrases for a bingo card');
        }

        const cardPhrases = this.shuffleArray([...this.phrases]).slice(0, 24);
        const card = [];
        let phraseIndex = 0;

        for (let i = 0; i < 5; i++) {
            const row = [];
            for (let j = 0; j < 5; j++) {
                if (i === 2 && j === 2) {
                    row.push('FREE');
                } else {
                    row.push(cardPhrases[phraseIndex++]);
                }
            }
            card.push(row);
        }
        return card;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    updatePhraseList() {
        this.phraseList.innerHTML = '';
        const sortedPhrases = [...this.phrases].sort();
        
        // Find the longest phrase
        const longestPhrase = sortedPhrases.reduce((longest, current) => 
            current.length > longest.length ? current : longest, '');
        
        // Get computed font size and family from phrase-list
        const phraseListStyles = window.getComputedStyle(this.phraseList);
        const fontSize = phraseListStyles.fontSize;
        const fontFamily = phraseListStyles.fontFamily;
        const fontWeight = phraseListStyles.fontWeight;
        
        // Create a temporary span to measure text width
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.fontFamily = fontFamily;
        tempSpan.style.fontSize = fontSize;
        tempSpan.style.fontWeight = fontWeight;
        tempSpan.textContent = `• ${longestPhrase}`;
        document.body.appendChild(tempSpan);
        
        // Calculate width with a larger fixed buffer for padding, borders, and scrollbar
        const textWidth = tempSpan.offsetWidth;
        const containerWidth = Math.ceil(textWidth + 70); // 70px buffer
        document.body.removeChild(tempSpan);
        
        // Set the width of the phrase container
        const phraseContainer = document.querySelector('.phrase-container');
        phraseContainer.style.width = `${containerWidth}px`;
        
        sortedPhrases.forEach((phrase, index) => {
            const div = document.createElement('div');
            div.className = 'phrase-item';
            div.textContent = `• ${phrase}`;
            div.addEventListener('click', () => this.onPhraseSelect(index));
            this.phraseList.appendChild(div);
        });
    }

    onPhraseSelect(index) {
        const sortedPhrases = [...this.phrases].sort();
        const phrase = sortedPhrases[index];
        const phraseItems = this.phraseList.getElementsByClassName('phrase-item');
        
        if (!this.selectedPhrases.has(phrase)) {
            this.selectedPhrases.add(phrase);
            phraseItems[index].classList.add('selected');
        }

        this.cards.forEach((card, cardIndex) => {
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (card[i][j] === phrase && !this.marked[cardIndex][i][j]) {
                        const cell = document.querySelector(`#card-${cardIndex} .cell[data-row="${i}"][data-col="${j}"]`);
                        cell.textContent = 'X';
                        cell.classList.add('marked');
                        this.marked[cardIndex][i][j] = true;
                    }
                }
            }
            if (!this.hasBingo[cardIndex] && this.checkBingo(cardIndex)) {
                this.displayBingo(cardIndex);
                this.hasBingo[cardIndex] = true;
            }
        });
    }

    checkBingo(cardIndex) {
        const marked = this.marked[cardIndex];
        
        // Check rows
        for (let i = 0; i < 5; i++) {
            if (marked[i].every(cell => cell)) return true;
        }
        
        // Check columns
        for (let i = 0; i < 5; i++) {
            if (marked.every(row => row[i])) return true;
        }
        
        // Check diagonals
        if (marked.every((row, i) => row[i])) return true;
        if (marked.every((row, i) => row[4 - i])) return true;
        
        return false;
    }

    displayBingo(cardIndex) {
        const card = document.getElementById(`card-${cardIndex}`);
        const overlay = document.createElement('div');
        overlay.className = 'bingo-overlay';
        overlay.textContent = 'BINGO!!!';
        card.appendChild(overlay);
    }

    resetGame() {
        this.cards = Array(6).fill().map(() => this.createBingoCard());
        this.marked = this.cards.map(() => 
            Array(5).fill().map(() => Array(5).fill(false))
        );
        this.marked.forEach(card => card[2][2] = true); // Mark FREE space
        this.hasBingo = Array(6).fill(false);
        this.selectedPhrases.clear();
        
        // Reset phrase list
        const phraseItems = this.phraseList.getElementsByClassName('phrase-item');
        Array.from(phraseItems).forEach(item => item.classList.remove('selected'));
        
        this.drawCards();
    }

    drawCards() {
        this.cardsContainer.innerHTML = '';
        
        this.cards.forEach((card, cardIndex) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'bingo-card';
            cardElement.id = `card-${cardIndex}`;
            
            // Add header
            const header = document.createElement('div');
            header.className = 'card-header';
            ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
                const div = document.createElement('div');
                div.textContent = letter;
                header.appendChild(div);
            });
            cardElement.appendChild(header);
            
            // Add grid
            const grid = document.createElement('div');
            grid.className = 'card-grid';
            
            card.forEach((row, i) => {
                row.forEach((phrase, j) => {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    if (phrase === 'FREE') {
                        cell.classList.add('free');
                    }
                    cell.textContent = phrase;
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    
                    if (phrase !== 'FREE') {
                        cell.addEventListener('click', () => this.markCell(cardIndex, i, j, cell));
                    }
                    
                    grid.appendChild(cell);
                });
            });
            
            cardElement.appendChild(grid);
            this.cardsContainer.appendChild(cardElement);
        });
    }

    markCell(cardIndex, row, col, cell) {
        if (!this.marked[cardIndex][row][col]) {
            this.marked[cardIndex][row][col] = true;
            cell.textContent = 'X';
            cell.classList.add('marked');
            
            if (!this.hasBingo[cardIndex] && this.checkBingo(cardIndex)) {
                this.displayBingo(cardIndex);
                this.hasBingo[cardIndex] = true;
            }
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new BingoGame();
}); 