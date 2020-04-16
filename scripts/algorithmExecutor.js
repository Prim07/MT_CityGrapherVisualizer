import { validate } from './formValidator.js';
import { showMixin } from './alertViewer.js';
import { getCreateTaskUri } from './config/config.js';
import { getUriForAlgorithmTaskResult } from './config/config.js';
import { getJsonData } from './rest/get.js';
import { postJsonData } from './rest/post.js';
import { deleteForUri } from './rest/delete.js';
import { drawGraph } from './graph.js';
import { initializeMap } from './map.js';
import { hideOsmMap } from './map.js';
import { showOsmMap } from './map.js';

const algorithmStartButton = document.getElementById("algorithmStartButton");
const algorithmCancelButton = document.getElementById("algorithmCancelButton");
const inputToggleDrawNodes = document.getElementById("inputToggleDrawNodes");
const inputToggleDrawCrossings = document.getElementById("inputToggleDrawCrossings");
const calculatingStatusContainer = document.getElementById("calculatingStatusContainer");
const statusMessage = document.getElementById("statusMessage");
const calculatingShortestPathsProgressProgressbar = document.getElementById("calculatingShortestPathsProgressProgressbar");

const maxNumberOfRequestForCalculationStatus = 500;
const millisecondsToWaitBetweenRequests = 1000;
var isTaskCancelled = false;

initializeView();

function initializeView() {
    initializeMap();
}

algorithmStartButton.onclick = function() {
    if (validate()) {
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
            sessionStorage.setItem('shouldDrawAllNodes', inputToggleDrawNodes.checked);
            sessionStorage.setItem('shouldDrawAllCrossings', inputToggleDrawCrossings.checked);
            getResultsFromAlgorithm(0, sessionStorage.getItem('uri'));
        })
        .catch(error => {
            setButtonsToInitialState();
            showMixin("An internal server error occured", "error");
            console.log(error);
        });
    }
}

algorithmCancelButton.onclick = function() {
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
            drawTempGraph(result['visualizationDataDTO']);
            setTimeout(getResultsFromAlgorithm, millisecondsToWaitBetweenRequests, requestCounter, uri);
        } else if (calculationStatus == "SUCCESS") {
            drawFinalGraph(result['visualizationDataDTO']);
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

function drawTempGraph(visualizationData) {
    showOsmMap();
    drawGraph(visualizationData);
}

function drawFinalGraph(visualizationData) {
    showMixin("Successfly completed calculating", "success");
    showOsmMap();
    setButtonsToInitialState();
    drawGraph(visualizationData);
}

function getPostDataForTaskInput(cityName, numberOfResults, algorithmType) {
    const data = {}
    data["cityName"] = cityName;
    data["numberOfResults"] = numberOfResults;
    data["algorithmType"] = algorithmType;
    return data;
}

function setButtonsToInitialState() {
    algorithmCancelButton.style.visibility = "collapse";
    algorithmStartButton.disabled = false;
}

function setButtonsToAwaitingState() {
    algorithmCancelButton.style.visibility = "visible";
    algorithmStartButton.disabled = true;
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