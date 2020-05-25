import { showError } from './alertViewer.js';

const maxNumberOfResultsForBruteForce = 3;

export function validateInputsForRunningAlgorithm() {
    if (validateInputsForDrawingGraph() == false) {
        return false;
    }

    const numberOfResultsInput = document.getElementById('numberOfResultsInput');
    const numberOfResults = numberOfResultsInput.value;
    const algorithmMethod = document.getElementById("algorithmMethod");
    const algorithmType = algorithmMethod.options[algorithmMethod.selectedIndex].value;

    if ((numberOfResults > maxNumberOfResultsForBruteForce) && (algorithmType == "bf")) {
        showError("You cannot run Brute Force Algorithm with more than 3 requested results.")
        return false;
    }

    return true;
}

export function validateInputsForDrawingGraph() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value;
    if (city == null || city == "") {
        showError("City must not be empty");
        return false;
    }

    return true;
}