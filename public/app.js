const crypto = window.crypto || window.msCrypto;

const LEVEL = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  ALL: 'all',
};

function getRandomNumber(length) {
  return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1) * length);
}

function scramble(word) {
  const letters = word.split('');

  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const tmp = letters[i];

    letters[i] = letters[j];
    letters[j] = tmp;
  }

  // Handle case where scrambling results in unscrambled word
  if (letters.join('') === word) {
    const firstLetter = letters[0];
    const lastIndex = letters.length - 1;

    letters[0] = letters[lastIndex];
    letters[lastIndex] = firstLetter;
  }

  return letters.join('');
}

const app = Vue.createApp({
  data() {
    return {
      originalWord: '',
      scrambledWord: '',
      originalUserGuess: '',
      difficulty: LEVEL.MEDIUM,
      invalidGuesses: [],
      revealCode: '0',
    };
  },

  mounted: function () {
    this.getScrambledWord();
  },

  methods: {
    getScrambledWord: function () {
      const filteredWords = words
        .filter(word => word.length >= this.minWordLength && word.length <= this.maxWordLength);

      this.originalWord = filteredWords[getRandomNumber(filteredWords.length)];
      this.scrambledWord = scramble(this.originalWord);
      this.originalUserGuess = '';

      this.$refs.guess.focus();
    }
  },

  computed: {
    userGuess: function () {
      return this.originalUserGuess.toLowerCase().trim();
    },

    remainingLetters: function () {
      const wordLetters = this.scrambledWord.split('');

      this.invalidGuesses = [];

      this.userGuess.split('').forEach(guessedLetter => {
        const i = wordLetters.indexOf(guessedLetter);

        if (i >= 0) {
          wordLetters.splice(i, 1);
        } else {
          this.invalidGuesses.push(guessedLetter);
        }
      });

      if (wordLetters.length === 0) {
        return '(None)';
      }

      return wordLetters.join('');
    },

    minWordLength: function () {
      if (this.difficulty === LEVEL.MEDIUM) return 6;
      if (this.difficulty === LEVEL.HARD) return 8;

      return 4; // Easy and all both have 4 as minimum
    },

    maxWordLength: function () {
      if (this.difficulty === LEVEL.EASY) return 5;
      if (this.difficulty === LEVEL.MEDIUM) return 7;

      return 10; // Hard and all both have 10 as maximum
    },

    isCorrectGuess: function () {
      const isCorrect = this.originalWord !== '' && this.originalWord === this.userGuess;

      if (isCorrect) {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 }
        });
      }

      return isCorrect;
    },
  },
});

app.mount('#app');
