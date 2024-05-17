document.addEventListener('DOMContentLoaded', function() {
    loadMedicos();
    document.getElementById('add-medico-form').addEventListener('submit', handleMedicoSubmit);
});

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

async function loadMedicos() {
    try {
        const data = await fetchData('http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/medicos/');
        const medicosTable = document.getElementById('medicos-list');
        medicosTable.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos datos
        data.forEach(medico => {
            let row = medicosTable.insertRow();
            row.insertCell(0).innerText = medico[1]; // Acceder al nombre por índice
            row.insertCell(1).innerText = medico[2]; // Acceder a la especialidad por índice

            let editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
            editButton.onclick = () => editMedico(medico[0]);  // Usar el ID que es el primer elemento del array
            row.insertCell(2).appendChild(editButton);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded';
            deleteButton.onclick = () => deleteMedico(medico[0]);  // Usar el ID
            row.insertCell(3).appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error loading medicos:', error);
        alert("Error al cargar los médicos: " + error.message);
    }
}

async function handleMedicoSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('medico-name').value;
    const specialty = document.getElementById('medico-specialty').value;
    const medicoId = document.getElementById('medico-id') ? document.getElementById('medico-id').value : null;
    const url = medicoId ? `http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/medicos/${medicoId}` : 'http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/medicos/';
    const method = medicoId ? 'PUT' : 'POST';
    const data = { name, specialty };

    try {
        const response = await (medicoId ? updateData(url, data) : postData(url, data));
        loadMedicos();  // Recarga la lista de médicos
    } catch (error) {
        console.error('Error saving medico:', error);
    }
}

function editMedico(id) {
    fetchData(`http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/medicos/${id}`)
        .then(medico => {
            if (!medico || medico.length === 0) {
                throw new Error('No se pudo cargar la información del médico para editar.');
            }
            console.log(`Medico details fetched: `, medico); // Añadido para depuración
            document.getElementById('edit-medico-id').value = medico[0];
            document.getElementById('edit-medico-name').value = medico[1];
            document.getElementById('edit-medico-specialty').value = medico[2];
            openModal();
        })
        .catch(error => {
            console.error('Error fetching medico details:', error);
            alert("Error al cargar detalles del médico: " + error.message);
        });
}

async function deleteMedico(id) {
    try {
        const response = await fetch(`http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/medicos/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        loadMedicos();  // Recargar la list a de médicos después de eliminar
    } catch (error) {
        console.error('Error deleting medico:', error);
        alert("No se pudo eliminar el médico: " + error.message);
    }
}

function openModal() {
    document.getElementById('edit-medico-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('edit-medico-modal').classList.add('hidden');
}

document.getElementById('edit-medico-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const id = document.getElementById('edit-medico-id').value;
    const name = document.getElementById('edit-medico-name').value;
    const specialty = document.getElementById('edit-medico-specialty').value;
    const url = `http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/medicos/${id}`;
    const data = { name, specialty };

    try {
        console.log(`Updating medico with id: ${id}, data: `, data); // Añadido para depuración
        await updateData(url, data);
        closeModal();
        loadMedicos();
    } catch (error) {
        console.error('Error updating medico:', error);
        alert("Error al guardar los cambios: " + error.message);
    }
});
