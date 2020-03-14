export async function getJsonData(url) {
    const response = await fetch(url);
    const jsonData = await response.json();
    return jsonData;
}
