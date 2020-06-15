import { validateInputsForRunningAlgorithm, validateInputsForDrawingGraph } from './formValidator.js';
import { showMixin } from './alertViewer.js';
import { getUriForGetGraph, getCreateTaskUri } from './config/config.js';
import { getJsonData } from './rest/get.js';
import { postJsonData } from './rest/post.js';
import { deleteForUri } from './rest/delete.js';
import { drawGraph } from './graph.js';
import { initializeMap, hideOsmMap, showOsmMap, addInteractionOnMap, clearVoronoiDiagram, removePolygonFeature, getPrioritizedGraphNodes } from './map.js';

const drawGraphButton = document.getElementById("drawGraphButton");
const algorithmStartButton = document.getElementById("algorithmStartButton");
const algorithmCancelButton = document.getElementById("algorithmCancelButton");
const cityInput = document.getElementById("cityInput");
const inputToggleDrawNodes = document.getElementById("inputToggleDrawNodes");
const inputVoronoiTriangulation = document.getElementById("inputVoronoiTriangulation");
const inputToggleDrawCrossings = document.getElementById("inputToggleDrawCrossings");
const calculatingStatusContainer = document.getElementById("calculatingStatusContainer");
const statusMessage = document.getElementById("statusMessage");
const calculatingShortestPathsProgressProgressbar = document.getElementById("calculatingShortestPathsProgressProgressbar");
const algorithmResultInfo = document.getElementById("algorithmResultInfo");

inputVoronoiTriangulation.onchange = refreshViewBasedOnVoronoiTriangulation;
cityInput.oninput = refreshViewBasedOnVoronoiTriangulation;

const maxNumberOfRequestForCalculationStatus = 500;
const millisecondsToWaitBetweenRequests = 1000;
var isTaskCancelled = false;

initializeView();
refreshViewBasedOnVoronoiTriangulation();

function initializeView() {
    initializeMap();
}

drawGraphButton.onclick = function () {
    if (validateInputsForDrawingGraph()) {
        showMixin("Started collecting data for drawing graph");
        const cityName = cityInput.value;
        const cityGraphDataUri = getUriForGetGraph(cityName);
        setButtonsToAwaitingState(false);

        getJsonData(cityGraphDataUri).then(result => {
            showMixin("Collecting data completed");
            refreshToolsValuesInSessionStorage();
            drawGraph(result);
            addInteractionOnMap();
            setButtonsToInitialState();
        })
            .catch(error => {
                showMixin("An internal server error occured", "error");
                console.log(error);
                setButtonsToInitialState();
            });

    }
}

algorithmStartButton.onclick = function () {
    hideResultInfo();

    if (validateInputsForRunningAlgorithm()) {
        isTaskCancelled = false;
        hideOsmMap();

        algorithmStartButton.disabled = true;

        const cityInput = document.getElementById("cityInput");
        const numberOfResultsInput = document.getElementById("numberOfResultsInput");
        const cityName = cityInput.value;
        const numberOfResults = numberOfResultsInput.value;
        const algorithmMethod = document.getElementById("algorithmMethod");
        const algorithmType = algorithmMethod.options[algorithmMethod.selectedIndex].value;

        const cityGraphDataUri = getCreateTaskUri();

        const data = getPostDataForTaskInput(cityName, numberOfResults, algorithmType);

        showMixin("Started collecting data for city " + cityName);

        postJsonData(cityGraphDataUri, data).then(result => {
            showMixin("Started algorithm for city " + cityName);
            setButtonsToAwaitingState();
            sessionStorage.setItem('uri', result['uri']);
            refreshToolsValuesInSessionStorage();
            getResultsFromAlgorithm(0, sessionStorage.getItem('uri'));
        })
            .catch(error => {
                setButtonsToInitialState();
                showMixin("An internal server error occured", "error");
                console.log(error);
            });
    }
}

algorithmCancelButton.onclick = function () {
    isTaskCancelled = true;

    const uri = sessionStorage.getItem('uri');
    deleteForUri(uri).then(result => {
        console.log(result);
    })
        .catch(error => {
            setButtonsToInitialState();
            showMixin("An internal server error occured", "error");
            console.log(error);
        });
}

function getResultsFromAlgorithm(requestCounter, uri) {

    getJsonData(uri).then(result => {
        const algorithmResult = result['algorithmResultDTO'];
        const calculationStatus = algorithmResult['status'];

        updateViewDuringTask(algorithmResult, requestCounter, calculationStatus);

        if (!isTaskCancelled && (calculationStatus == "CALCULATING")) {
            drawTempGraph(result['visualizationDataDTO'], result['algorithmResultDTO']['fitnessScore']);
            setTimeout(getResultsFromAlgorithm, millisecondsToWaitBetweenRequests, requestCounter, uri);
        } else if (calculationStatus == "SUCCESS") {
            showResultInfo();
            drawFinalGraph(result['visualizationDataDTO'], result['algorithmResultInfoDTO']);
        } else if (calculationStatus == "CANCELLED") {
            setButtonsToInitialState();
        } else if (!isTaskCancelled && (requestCounter < maxNumberOfRequestForCalculationStatus)) {
            requestCounter++;
            setTimeout(getResultsFromAlgorithm, millisecondsToWaitBetweenRequests, requestCounter, uri);
        } else {
            console.log('Task cancelled');
        }
    })
        .catch(error => {
            setButtonsToInitialState();
            showMixin("An internal server error occured", "error");
            console.log(error);
        });
}

function drawTempGraph(visualizationData, fitnessScore) {
    showOsmMap();
    drawGraph(visualizationData);
    showResultInfo(fitnessScore);
}

function drawFinalGraph(visualizationData, algorithmResultInfoDTO) {
    showMixin("Successfly completed calculating", "success");
    showOsmMap();
    setButtonsToInitialState();
    drawGraph(visualizationData);
    showResultInfo(algorithmResultInfoDTO['fitnessScore'], algorithmResultInfoDTO['numberOfEdges'], algorithmResultInfoDTO['numberOfNodes']);
}

function getPostDataForTaskInput(cityName, numberOfResults, algorithmType) {
    const data = {}
    data["cityName"] = cityName;
    data["numberOfResults"] = numberOfResults;
    data["algorithmType"] = algorithmType;
    data["nodesPriorities"] = getPrioritizedGraphNodes();
    return data;
}

function refreshToolsValuesInSessionStorage() {
    sessionStorage.setItem('shouldDrawAllNodes', inputToggleDrawNodes.checked);
    sessionStorage.setItem('shouldDrawAllCrossings', inputToggleDrawCrossings.checked);
}

function showResultInfo(fitnessScore, numOfEdges = null, numOfVertices = null) {
    let infoContent = "";
    infoContent += "f <sub>score</sub> = " + parseFloat(fitnessScore).toFixed(4);

    if (numOfEdges != null) {
        infoContent += "</br> |E| = " + numOfEdges;
    }

    if (numOfVertices != null) {
        infoContent += "</br> |V| = " + numOfVertices;
    }

    algorithmResultInfo.style.visibility = "visible";
    algorithmResultInfo.innerHTML = infoContent;
}

function hideResultInfo() {
    algorithmResultInfo.style.visibility = "collapse";
}

function setButtonsToInitialState() {
    algorithmCancelButton.style.visibility = "collapse";
    algorithmStartButton.disabled = false;
    drawGraphButton.disabled = false;
    drawGraphButton.style.backgroundColor = "#2196F3";
}

function setButtonsToAwaitingState(shouldShowCancelButton = true) {
    if (shouldShowCancelButton) {
        algorithmCancelButton.style.visibility = "visible";
    }
    algorithmStartButton.disabled = true;
    drawGraphButton.disabled = true;
}

function updateViewDuringTask(result, requestCounter, calculationStatus) {
    if (shouldUpdateProgressbarView(requestCounter, calculationStatus)) {
        let progress = result["calculatingShortestPathsProgress"];
        calculatingStatusContainer.style.display = "block";
        calculatingShortestPathsProgressProgressbar.style = "width: " + progress + "%";
        statusMessage.innerText = "Calculating shortest paths distances";
        calculatingShortestPathsProgressProgressbar.innerText = progress + "%";
    } else if (calculatingStatusContainer.style.display != "none") {
        calculatingStatusContainer.style.display = "none";
    }
}

function shouldUpdateProgressbarView(requestCounter, calculationStatus) {
    return !isTaskCancelled
        && (requestCounter < maxNumberOfRequestForCalculationStatus)
        && (calculationStatus == "CALCULATING_SHORTEST_PATHS");
}

function refreshViewBasedOnVoronoiTriangulation() {
    if (inputVoronoiTriangulation.checked) {
        algorithmStartButton.disabled = true;
        drawGraphButton.style.backgroundColor = "#FFBE0B";
    } else {
        clearVoronoiDiagram();
        algorithmStartButton.disabled = false;
        drawGraphButton.style.backgroundColor = "#2196F3";
    }
}

// needs to be here because fuck JS
document.addEventListener('keydown', function (event) {
    if (event.key === "Escape") {
        removePolygonFeature();
    }
});