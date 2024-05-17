document.addEventListener('DOMContentLoaded', function() {
    loadPacientes();
    document.getElementById('add-paciente-form').addEventListener('submit', handlePacienteSubmit);
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

async function loadPacientes() {
    try {
        const data = await fetchData('http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/pacientes/');
        const pacientesTable = document.getElementById('pacientes-list');
        pacientesTable.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos datos
        data.forEach(paciente => {
            let row = pacientesTable.insertRow();
            row.insertCell(0).innerText = paciente[1]; // Acceder al nombre por índice
            row.insertCell(1).innerText = paciente[2]; // Acceder a la edad por índice

            let editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
            editButton.onclick = () => editPaciente(paciente[0]);  // Usar el ID que es el primer elemento del array
            row.insertCell(2).appendChild(editButton);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded';
            deleteButton.onclick = () => deletePaciente(paciente[0]);  // Usar el ID
            row.insertCell(3).appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error loading pacientes:', error);
        alert("Error al cargar los pacientes: " + error.message);
    }
}

async function handlePacienteSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('paciente-name').value;
    const age = document.getElementById('paciente-age').value;
    const pacienteId = document.getElementById('paciente-id') ? document.getElementById('paciente-id').value : null;
    const url = pacienteId ? `http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/pacientes/${pacienteId}` : 'http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/pacientes/';
    const method = pacienteId ? 'PUT' : 'POST';
    const data = { name, age };

    try {
        const response = await (pacienteId ? updateData(url, data) : postData(url, data));
        loadPacientes();  // Recarga la lista de pacientes
    } catch (error) {
        console.error('Error saving paciente:', error);
    }
}

function editPaciente(id) {
    fetchData(`http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/pacientes/${id}`)
        .then(paciente => {
            if (!paciente || paciente.length === 0) {
                throw new Error('No se pudo cargar la información del paciente para editar.');
            }
            console.log(`Paciente details fetched: `, paciente); // Añadido para depuración
            document.getElementById('edit-paciente-id').value = paciente[0];
            document.getElementById('edit-paciente-name').value = paciente[1];
            document.getElementById('edit-paciente-age').value = paciente[2];
            openModal();
        })
        .catch(error => {
            console.error('Error fetching paciente details:', error);
            alert("Error al cargar detalles del paciente: " + error.message);
        });
}

async function deletePaciente(id) {
    try {
        const response = await fetch(`http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/pacientes/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        loadPacientes();  // Recargar la lista de pacientes después de eliminar
    } catch (error) {
        console.error('Error deleting paciente:', error);
        alert("No se pudo eliminar el paciente: " + error.message);
    }
}

function openModal() {
    document.getElementById('edit-paciente-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('edit-paciente-modal').classList.add('hidden');
}

document.getElementById('edit-paciente-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const id = document.getElementById('edit-paciente-id').value;
    const name = document.getElementById('edit-paciente-name').value;
    const age = document.getElementById('edit-paciente-age').value;
    const url = `http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/pacientes/${id}`;
    const data = { name, age };

    try {
        console.log(`Updating paciente with id: ${id}, data: `, data); // Añadido para depuración
        await updateData(url, data);
        closeModal();
        loadPacientes();
    } catch (error) {
        console.error('Error updating paciente:', error);
        alert("Error al guardar los cambios: " + error.message);
    }
});
