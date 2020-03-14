export async function deleteForUri(uri) {
    const options = {
        method: 'DELETE'
    }
    const response = await fetch(uri, options);
    const jsonData = await response.json();
    return jsonData;
}