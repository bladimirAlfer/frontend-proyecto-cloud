async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to post data');
    return response.json();
}

async function updateData(url, data) {
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update data');
    return response.json();
}

async function deleteData(url) {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete data');
    return response.json();
}
