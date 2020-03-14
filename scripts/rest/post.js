export async function postJsonData(uri, data) {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    }
    const response = await fetch(uri, options);
    const jsonData = await response.json();
    return jsonData;
}