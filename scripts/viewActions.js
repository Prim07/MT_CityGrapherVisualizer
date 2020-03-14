
const inputToggleUseBruteForce = document.getElementById("inputToggleUseBruteForce");
const bruteForceAddidtionalDescription = document.getElementById("bruteForceAddidtionalDescription");

inputToggleUseBruteForce.onchange = function() {
    if (inputToggleUseBruteForce.checked == true) {
        bruteForceAddidtionalDescription.style.visibility = "visible";
    } else {
        bruteForceAddidtionalDescription.style.visibility = "collapse";
    }
}