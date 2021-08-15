

class Game {

  constructor(choices, slots) {
    this.newGame(choices, slots);
  }

  newGame(choices, slots) {
    this.choices = choices;
    this.slots = slots;
    this.refresh();
  }

  refresh() {
    this.allPossibilities = [];
    this.allPossible(this.choices, this.slots);//recursively fill allPossibilities
    this.answer = this.generateAnswer();
  }

  allPossible(choices, slots) {//recursively generate all permutations
    let position;
    if (arguments.length == 2) {//check if this is the first call (missing third argument)
      position = 0;//start the recursion depth at 0
    } else {
      position = arguments[2];//continue recursion at this depth
    }
    if (position >= slots.length) {//last slot has been filled
      let possibility = { possible: true, permutation: [...slots] };//make a possible permutation object
      this.allPossibilities.push(possibility);//add object to array of possible permutations
    } else {
      for (let i = 0; i < choices.length; i++) {
        let filtered = [...choices];
        slots[position] = choices[i];
        filtered.splice(filtered.indexOf(choices[i]), 1);//remove the choice used
        this.allPossible(filtered, slots, position + 1);//recursion with position incremented
      }
    }
  }

  generateAnswer() {//pick a random answer from all possible answers to test against
    return this.allPossibilities[Math.floor(Math.random() * this.allPossibilities.length)].permutation;
  }

  guess(slots) {//this is for guessing against the internally stored answer for testing
    if (this.answer.length != slots.length) {
      console.log("slots and answer size mismatch");
      return 0;
    }
    let results = this.#makeResults(slots, this.answer);
    this.updateAllPossible(slots, results);
    return results;
  }

  updateAllPossible(slots, results) {
    console.log(slots, results);
    for (let i = 0; i < this.allPossibilities.length; i++) {//check all permutations left
      let testResult = this.#makeResults(slots, this.allPossibilities[i].permutation);
      if (!(testResult.correctChoice == results.correctChoice && testResult.correctSlot == results.correctSlot)) {
        //if the result from permutation is not the same as the result of the guess, set the bool to mark it as eliminated
        this.allPossibilities[i].possible = false;
      }
    }
  }

  countEliminated(slots, results) {
    let count = 0;
    for (let i = 0; i < this.allPossibilities.length; i++) {//check all permutations left
      let testResult = this.#makeResults(slots, this.allPossibilities[i].permutation);
      if (!(testResult.correctChoice == results.correctChoice && testResult.correctSlot == results.correctSlot) && this.allPossibilities[i].possible) {
        //if the result from permutation is not the same as the result of the guess, count the elimination
        count++;
      }
    }
    return count;
  }

  #makeResults(guess, answer) {//generates the response from a guess and answer
    let correctChoices = 0;
    let correctSlots = 0;
    for (let i = 0; i < answer.length; i++) {
      if (guess[i] == answer[i]) {
        correctSlots++;
      } else {
        for (let j = 0; j < guess.length; j++) {
          if (guess[i] == answer[j] && j != i) {
            correctChoices++;
          }
        }
      }
    }
    return { correctSlot: correctSlots, correctChoice: correctChoices };//result
  }


  nextGuess() {//work out which guess has the potential to eliminate the most possibilities

    let guesses = {
      avg: {
        avg: -1,
        min: -1,
        // max: -1
      },
      // max: {
      //   avg: -1,
      //   min: -1,
      //   max: -1
      // },
      min: {
        avg: -1,
        min: -1,
        // max: -1
      }
    };

    guesses.min.min = -1;
    guesses.avg.avg = -1;
    // guesses.max.max = -1;
    // let bestIndex = {least:-1,most:-1,average:-1};
    // let countPossible = 0;
    for (let i = 0; i < this.allPossibilities.length; i++) {//check all possible permutations as guesses
      if (this.allPossibilities[i].possible == true) {
        // countPossible++;
        let leastEliminated = -1;
        let averageEliminated = -1;
        let averageEntries = 0;
        // let mostEliminated = -1;
        for (let j = 0; j < this.allPossibilities.length; j++) {//check all possible permutations as answers
          if (this.allPossibilities[i].possible == true) {
            //count elimination potential
            let results = this.#makeResults(this.allPossibilities[i].permutation, this.allPossibilities[j].permutation);
            let eliminated = this.countEliminated(this.allPossibilities[i].permutation, results);
            if (leastEliminated == -1) {
              //fresh entry
              leastEliminated = eliminated;
              averageEliminated = eliminated;
              // mostEliminated = eliminated;
              averageEntries = 1;
            } else {
              leastEliminated = Math.min(leastEliminated, eliminated);
              // mostEliminated = Math.max(mostEliminated, eliminated);
              averageEliminated = (averageEliminated * averageEntries) + eliminated;
              averageEntries++;
              averageEliminated /= averageEntries;
            }
          }
        }
        if (guesses.min.min == -1) {
          //fresh entry
          guesses.min.min = leastEliminated;
          // guesses.min.max = mostEliminated;
          guesses.min.avg = averageEliminated;

          guesses.avg.min = leastEliminated;
          // guesses.avg.max = mostEliminated;
          guesses.avg.avg = averageEliminated;

          // guesses.max.min = leastEliminated;
          // guesses.max.max = mostEliminated;
          // guesses.max.avg = averageEliminated;

          guesses.minPermutation = this.allPossibilities[i].permutation;
          // guesses.maxPermutation = this.allPossibilities[i].permutation;
          guesses.avgPermutation = this.allPossibilities[i].permutation;
        } else {
          if (leastEliminated > guesses.min.min) {
            guesses.min.min = leastEliminated;
            // guesses.min.max = mostEliminated;
            guesses.min.avg = averageEliminated;
            guesses.minPermutation = this.allPossibilities[i].permutation;
          }
          // if (mostEliminated > guesses.max.max) {
          //   guesses.max.min = leastEliminated;
          //   guesses.max.max = mostEliminated;
          //   guesses.max.avg = averageEliminated;
          //   guesses.maxPermutation = this.allPossibilities[i].permutation;
          // }
          if (averageEliminated > guesses.avg.avg) {
            // console.log(averageEliminated, guesses.avg.avg);
            guesses.avg.min = leastEliminated;
            // guesses.avg.max = mostEliminated;
            guesses.avg.avg = averageEliminated;
            guesses.avgPermutation = this.allPossibilities[i].permutation;
          }
        }
      }
    }
    return guesses;
  }

}

// let choices = Array(6).fill().map((element, index) => index + 1);
// let slots = Array(3).fill(0);
// let test = new Game(choices, slots);
// addGuessField(slots);

let game = new Game([], []);
document.getElementById('start').onclick = () => (startGame());

function startGame() {
  //clear guess field
  let parent = document.getElementById('guess-container');
  let oldFields = parent.getElementsByClassName('guess-div');
  while (oldFields.length > 0) {
    parent.removeChild(oldFields[0]);
  }
  // for (let i = 0 ; i < oldFields.length ; i++) {
  //   oldFields[i].remove();
  // }
  let numSlots = (document.getElementById('slots').value.match(/0/g) || []).length;
  let slots = Array(numSlots).fill(0);
  //feed values to start a game
  let choices = document.getElementById('choices').value.match(/[a-zA-Z0-9]/g);
  game.newGame(choices, slots);
  //make new guess field
  addGuessField(slots);
}

function submitGuess(event) {
  //disable further submits from this button
  event.originalTarget.disabled = true;
  let result;
  let slots = []
  {
    let idNumber = event.target.id.match(/submitGuess([0-9]*)/)[1];
    // console.log(event.target.id.match(/submitGuess([0-9]*)/));
    let resultSelect = document.getElementById('result' + idNumber);
    let resultString = resultSelect.value.match(/([0-9])C([0-9])P/);
    result = { correctSlot: resultString[2], correctChoice: resultString[1] }
    slots = [...(document.getElementById('guess' + idNumber).value)];

  }
  game.updateAllPossible(slots, result);
  //make new guess field
  addGuessField(slots);//add guess field just counts the number of slots so passing in this filled slots is fine for now
}

function addGuessField(slots) {
  let parent = document.getElementById('guess-container');
  let idNumber = parent.getElementsByClassName("guess-div").length;
  let div = document.createElement('div');
  div.id = "guess-div" + idNumber;
  div.className = "guess-div";
  parent.append(div);
  let inputGuess = document.createElement('input');
  inputGuess.placeholder = 'guess';
  inputGuess.id = 'guess' + idNumber;
  div.append(inputGuess);
  let resultSelect = document.createElement('select');
  resultSelect.id = 'result' + idNumber;
  div.append(resultSelect);
  for (let p = 0; p <= slots.length; p++) {//permutations: correct slot = !
    for (let c = 0; c <= slots.length; c++) {//combinations: correct guess wrong slot = ?
      if (p + c <= slots.length) {
        let option = document.createElement('option');
        option.value = c + "C" + p + "P";
        option.innerHTML = "[" + '!'.repeat(p) + '?'.repeat(c) + ' '.repeat(slots.lenght - c - p) + "]";
        resultSelect.append(option);

      }
    }
  }
  let submitbutton = document.createElement('input');
  submitbutton.type = 'button';
  submitbutton.id = 'submitGuess' + idNumber;
  submitbutton.value = 'SUBMIT';
  submitbutton.onclick = (e) => (submitGuess(e));
  div.append(submitbutton);
  let guesses = game.nextGuess();
  let textSpan = document.createElement('table');
  div.append(textSpan);
  let guessText = [];
  guessText[0] = "MIN: " + guesses.minPermutation + "[min:" + guesses.min.min + ", avg:" + Math.round(guesses.min.avg) + "]";
  guessText[1] = "AVG: " + guesses.avgPermutation + "[min:" + guesses.avg.min + ", avg:" + Math.round(guesses.avg.avg) + "]";
  // guessText[2] = "MAX: " + guesses.maxPermutation + "[min:" + guesses.max.min + ", avg:" + Math.round(guesses.max.avg) + ", max" + guesses.max.max + "]";
  for (let i = 0; i < 2; i++) {
    let guessTextBox = document.createElement('div');
    guessTextBox.id = 'generated-guess' + idNumber + '-' + i;
    guessTextBox.innerHTML = guessText[i];
    textSpan.append(guessTextBox);
  }
}