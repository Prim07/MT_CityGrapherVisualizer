import { showError } from './alertViewer.js';

const maxNumberOfResultsForBruteForce = 3;

export function validate() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value;
    if(city == null || city == "") {
        showError("City must not be empty");
        return false;
    }

    const inputToggleUseBruteForce = document.getElementById('inputToggleUseBruteForce');
    const numberOfResultsInput = document.getElementById('numberOfResultsInput');
    const numberOfResults = numberOfResultsInput.value;
    if (inputToggleUseBruteForce.checked && numberOfResults > maxNumberOfResultsForBruteForce) {
        showError("You cannot run Brute Force Algorithm with more than 3 requested results.")
        return false;
    }

    return true;
}