import configJson from "./config.json";

export function getCreateTaskUri() {
    return getCreateTaskEndpointPath();
}

export function getUriForAlgorithmTask(taskId) {
    const algorithmBaseUrl = getAlgorithmBaseUrl();
    return algorithmBaseUrl + '/' + taskId;
}

export function getUriForAlgorithmTaskResult(taskId) {
    const dataCollectorBaseUrl = getDataCollectorBaseUrl();
    const algorithmResultEndpoint = getDataCollectorEndpoints()['algorithmResult'];
    return dataCollectorBaseUrl  + algorithmResultEndpoint  + taskId;
}

function getCreateTaskEndpointPath() {
    const dataCollectorBaseUrl = getDataCollectorBaseUrl();
    const createTaskEndpoint = getDataCollectorEndpoints()['createTask'];
    return dataCollectorBaseUrl + createTaskEndpoint;
}

function getDataCollectorBaseUrl() {
    return configJson['urls']['dataCollector']['baseUrl'];
}

function getDataCollectorEndpoints() {
    return configJson['urls']['dataCollector']['endpoints'];
}

function getAlgorithmBaseUrl() {
    return configJson['urls']['algorithm']['baseUrl'];
}

function getAlgorithmEndpoints() {
    return configJson['urls']['algorithm']['endpoints'];
}

function encodeQueryParams(url, params) {
    const keys = Object.keys(params);
    url = url + '?' + keys[0] + '=' + params[keys[0]];
    for (let i = 1; i < keys.length; ++i) {
        url += '&' + keys[i] + '=' + params[keys[i]];
    }
    return url;
}
