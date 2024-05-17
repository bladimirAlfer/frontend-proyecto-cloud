document.addEventListener('DOMContentLoaded', function() {
    loadCitas();
    loadMedicos();
    loadPacientes();
    document.getElementById('add-cita-form').addEventListener('submit', handleCitaSubmit);
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

async function loadCitas() {
    try {
        const data = await fetchData('http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/citas/');
        const citasTable = document.getElementById('citas-list');
        citasTable.innerHTML = '';  // Limpiar la tabla antes de agregar nuevos datos
        data.forEach(cita => {
            let row = citasTable.insertRow();
            row.insertCell(0).innerText = new Date(cita.date).toLocaleString(); // Formatear la fecha
            row.insertCell(1).innerText = cita.medico_name;
            row.insertCell(2).innerText = cita.paciente_name;

            let editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
            editButton.onclick = () => editCita(cita.id);
            row.insertCell(3).appendChild(editButton);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded';
            deleteButton.onclick = () => deleteCita(cita.id);
            row.insertCell(4).appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error loading citas:', error);
        alert("Error al cargar las citas: " + error.message);
    }
}

async function loadMedicos() {
    try {
        const data = await fetchData('http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/medicos/');
        const medicoSelect = document.getElementById('cita-medico');
        const editMedicoSelect = document.getElementById('edit-cita-medico');
        medicoSelect.innerHTML = '<option value="">Seleccione un médico</option>';
        editMedicoSelect.innerHTML = '<option value="">Seleccione un médico</option>';
        data.forEach(medico => {
            let option = document.createElement('option');
            option.value = medico[0];
            option.innerText = medico[1];
            medicoSelect.appendChild(option);

            let editOption = document.createElement('option');
            editOption.value = medico[0];
            editOption.innerText = medico[1];
            editMedicoSelect.appendChild(editOption);
        });
    } catch (error) {
        console.error('Error loading medicos:', error);
        alert("Error al cargar los médicos: " + error.message);
    }
}

async function loadPacientes() {
    try {
        const data = await fetchData('http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/pacientes/');
        const pacienteSelect = document.getElementById('cita-paciente');
        const editPacienteSelect = document.getElementById('edit-cita-paciente');
        pacienteSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
        editPacienteSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
        data.forEach(paciente => {
            let option = document.createElement('option');
            option.value = paciente[0];
            option.innerText = paciente[1];
            pacienteSelect.appendChild(option);

            let editOption = document.createElement('option');
            editOption.value = paciente[0];
            editOption.innerText = paciente[1];
            editPacienteSelect.appendChild(editOption);
        });
    } catch (error) {
        console.error('Error loading pacientes:', error);
        alert("Error al cargar los pacientes: " + error.message);
    }
}

async function handleCitaSubmit(event) {
    event.preventDefault();
    const medico_id = document.getElementById('cita-medico').value;
    const paciente_id = document.getElementById('cita-paciente').value;
    const date = document.getElementById('cita-date').value;
    const citaId = document.getElementById('cita-id') ? document.getElementById('cita-id').value : null;
    const url = citaId ? `http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/citas/${citaId}` : 'http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/citas/';
    const method = citaId ? 'PUT' : 'POST';
    const data = { medico_id, paciente_id, date };

    try {
        const response = await (citaId ? updateData(url, data) : postData(url, data));
        loadCitas();  // Recargar la lista de citas
    } catch (error) {
        console.error('Error saving cita:', error);
    }
}

function editCita(id) {
    fetchData(`http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/citas/${id}`)
        .then(cita => {
            if (!cita || cita.length === 0) {
                throw new Error('No se pudo cargar la información de la cita para editar.');
            }
            console.log(`Cita details fetched: `, cita); // Añadido para depuración
            document.getElementById('edit-cita-id').value = cita.id;
            document.getElementById('edit-cita-medico').value = cita.medico_id;
            document.getElementById('edit-cita-paciente').value = cita.paciente_id;
            document.getElementById('edit-cita-date').value = new Date(cita.date).toISOString().slice(0, 16);
            openModal();
        })
        .catch(error => {
            console.error('Error fetching cita details:', error);
            alert("Error al cargar detalles de la cita: " + error.message);
        });
}

async function deleteCita(id) {
    try {
        const response = await fetch(`http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/citas/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        loadCitas();  // Recargar la lista de citas después de eliminar
    } catch (error) {
        console.error('Error deleting cita:', error);
        alert("No se pudo eliminar la cita: " + error.message);
    }
}

function openModal() {
    document.getElementById('edit-cita-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('edit-cita-modal').classList.add('hidden');
}

document.getElementById('edit-cita-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const id = document.getElementById('edit-cita-id').value;
    const medico_id = document.getElementById('edit-cita-medico').value;
    const paciente_id = document.getElementById('edit-cita-paciente').value;
    const date = document.getElementById('edit-cita-date').value;
    const url = `http://ln-proyecto-1685771317.us-east-1.elb.amazonaws.com:8014/citas/${id}`;
    const data = { medico_id, paciente_id, date };

    try {
        console.log(`Updating cita with id: ${id}, data: `, data); // Añadido para depuración
        await updateData(url, data);
        closeModal();
        loadCitas();
    } catch (error) {
        console.error('Error updating cita:', error);
        alert("Error al guardar los cambios: " + error.message);
    }
});
