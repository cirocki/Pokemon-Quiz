document.addEventListener('DOMContentLoaded', function () {
    // GLOBAL VARIABLES
    const modal = document.querySelector('.modal');
    const startBtn = document.querySelector('.btn--start');
    const pokemonQuestionBox = document.querySelector('.question__text');
    const scoreBox = document.querySelector('.score__text');
    const summary = document.querySelector('.summary');
    const rating = document.querySelector('.rating');
    const answersBox = document.querySelector('.answers');
    const answerButton = document.querySelectorAll('.answers-list li button');

    // pokeAPI URL with no query 
    const pokeAPI = 'https://pokeapi.co/api/v2/';

    // I limited Pokemons to first generation, You can increase that number to make game more difficult ;D
    const pokemonsLimit = 151;

    // I think 10 questions is optimal for fast quiz
    const questionsLimit = 10;

    let randomPokemon = '';
    let allPokemonsArray = [];
    let score = 0;
    let questionNumber = 0;

    // HELPER FUNCTIONS
    const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    function checkStatus(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

    const disableButtons = function (state) {
        answerButton.forEach((button) => {
            button.disabled = state;
        });
    }

    //EVENT LISTENERS
    startBtn.addEventListener('click', function () {
        startGame();
    });

    // ###############################################


    // Fetch and create array with Pokemons - possible answers
    fetch(`${pokeAPI}pokemon/?limit=${pokemonsLimit}`)
        .then(checkStatus)
        .then((data) => data.json())
        .then(data => createPokemonsArray(data))
        .catch(error => console.log(error));

    // take the fetch results and push all pokemon names to allPokemonsArray
    const createPokemonsArray = function (data) {
        (data.results).forEach(function (item) {
            allPokemonsArray.push(item.name);
        });
    }

    // ###############################################

    // Fetch PokeAPI for random pokemon - question
    const findRandomPokemon = function () {
        fetch(`${pokeAPI}pokemon-species/${randomNumber(1,pokemonsLimit)}`)
            .then(checkStatus)
            .then((data) => data.json())
            .then(data => createQuestion(data))
            .then(data => createAnswers())
            .catch(error => console.log(error));

    }

    const createQuestion = function (data) {
        // assign fetched data to variables
        randomPokemon = data.name;
        let question = data.flavor_text_entries.filter(e => e.language.name === "en")[0].flavor_text;

        // change pokemon name to ... if question is too easy 
        randomPokemonCapitalized = randomPokemon.replace(randomPokemon.charAt(0), randomPokemon.charAt(0).toUpperCase());
        question = question.replace(randomPokemonCapitalized, "...");

        // show question 
        pokemonQuestionBox.textContent = question;
    }

    const createAnswers = function () {
        // create random possible answers
        let possibleAnswers = [];
        while (possibleAnswers.length < 3) {
            randomAnswer = allPokemonsArray[randomNumber(0, pokemonsLimit)];
            if (randomAnswer !== randomPokemon && !possibleAnswers.includes(randomAnswer) && typeof randomAnswer !== "undefined") {
                possibleAnswers.push(randomAnswer)
            }
        }
        // add 1 correct answer to 3 random answers, in random place in array
        possibleAnswers.splice([randomNumber(0, 4)], 0, randomPokemon);

        // assign answers to answer buttons in DOM
        for (i = 0; i < answerButton.length; i++) {
            answerButton[i].textContent = possibleAnswers[i]
        }
    }


    const checkAnswers = function () {
        answerButton.forEach((button) => {
            button.addEventListener('click', function () {
                // when player chose the answer disable buttons
                disableButtons(true);

                if (button.textContent === randomPokemon) {
                    // if answer is correct show green color,  
                    this.classList.add('correct');
                    // update score and show next question after second 
                    setTimeout(function () {
                        score++;
                        questionNumber++;
                        scoreBox.textContent = `${score}/${questionNumber}`;
                        button.classList.remove('correct');
                        // check if this is the last question 
                        endGame();
                        findRandomPokemon();
                        // enable buttons 
                        disableButtons(false);
                    }, 1000);


                } else {
                    // if answer is wrong show red color,... 
                    this.classList.add('wrong');
                    // show correct answer,...
                    setTimeout(function () {
                        answerButton.forEach((button) => {
                            if (button.textContent === randomPokemon)
                                button.classList.add('correct');
                        });
                    }, 500)

                    // update question number and show next question after time
                    setTimeout(function () {
                        questionNumber++;
                        scoreBox.textContent = `${score}/${questionNumber}`;
                        button.classList.remove('wrong');
                        answerButton.forEach((button) => {
                            button.classList.remove('correct');
                        });
                        // check if this is the last question 
                        endGame();
                        findRandomPokemon();
                        // enable buttons 
                        disableButtons(false);
                    }, 1400);

                }

            })
        })

    }

    // check if this is the last question and show summary message
    const endGame = function () {
        if (questionNumber == questionsLimit) {
            modal.classList.remove('hidden');
            answersBox.classList.add('hidden');
            summary.textContent = `Your score: ${score}/${questionNumber}. `;
            if (score > questionNumber / 2) {
                rating.textContent = 'Good Job. You are a real Pokémon Master!'
            } else {
                rating.textContent = 'You need to train more... Click the button and try again.'
            }
        }
    }


    // start game 
    const startGame = function () {

        // hide starting modal
        answersBox.classList.remove('hidden');
        modal.classList.add('hidden');

        // set initial score and question number 
        score = 0;
        questionNumber = 0;
        scoreBox.textContent = `${score}/${questionNumber}`;

        // fetch random pokemon, create question and answers
        findRandomPokemon()

    }

    // check answers function
    checkAnswers()

    // ####################################
    console.log(`DOM loaded`)
})
