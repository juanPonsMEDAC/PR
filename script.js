// Comptadors per a factures normals i "Efectivo*"
let invoiceCounterNormal = localStorage.getItem('invoiceCounterNormal') ? parseInt(localStorage.getItem('invoiceCounterNormal')) : 1;
let invoiceCounterEfectivo = localStorage.getItem('invoiceCounterEfectivo') ? parseInt(localStorage.getItem('invoiceCounterEfectivo')) : 1;

// Afegir productes al formulari
function addProduct() {
    const productList = document.getElementById('productList');
    const newProduct = document.createElement('div');
    newProduct.classList.add('product-item');
    newProduct.innerHTML = `
        <select class="product">
            <option value="Clase grupal primaria">Clase grupal primaria</option>
            <option value="Clase grupal secundaria">Clase grupal secundaria</option>
            <option value="Clase grupal bachillerato">Clase grupal bachillerato</option>
            <option value="Clase grupal selectividad o pruebas de acceso">Clase grupal selectividad o pruebas de acceso</option>
            <option value="Clase grupal modulo formativo">Clase grupal módulo formativo</option>
            <option value="Clase grupal universidad">Clase grupal universidad</option>
            <option value="Clase particular primaria">Clase particular primaria</option>
            <option value="Clase particular secundaria">Clase particular secundaria</option>
            <option value="Clase particular bachillerato">Clase particular bachillerato</option>
            <option value="Clase particular selectividad o pruebas de acceso">Clase particular selectividad o pruebas de acceso</option>
            <option value="Clase particular módulo formativo">Clase particular módulo formativo</option>
            <option value="Clase particular universidad">Clase particular universidad</option>
        </select>
        <input type="number" class="quantity" placeholder="Cantidad" min="1" required>
        <input type="number" class="unitPrice" placeholder="Precio por unidad (€)" min="0" required>
        <button type="button" class="btn-remove" onclick="removeProduct(this)">❌</button>
    `;
    productList.appendChild(newProduct);
}

// Eliminar producte
function removeProduct(button) {
    button.parentElement.remove();
    updateTotal();
}

// Calcula el total quan es modifiquen preus o quantitats
document.getElementById('productList').addEventListener('input', updateTotal);

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.product-item').forEach(item => {
        const quantity = item.querySelector('.quantity').value;
        const unitPrice = item.querySelector('.unitPrice').value;
        total += (quantity * unitPrice);
    });
    document.getElementById('totalPrice').value = total.toFixed(2);
}

// Genera la factura
function generateInvoice() {
    const clientName = document.getElementById('clientName').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const observations = document.getElementById('observations').value;
    const totalPrice = document.getElementById('totalPrice').value;
    const date = new Date().toLocaleDateString();

    if (!clientName || !totalPrice || totalPrice <= 0) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    let invoiceNumber;
    if (paymentMethod === "Efectivo*") {
        invoiceNumber = `FACT-1-${String(invoiceCounterEfectivo).padStart(5, '0')}`;
        invoiceCounterEfectivo++;
        localStorage.setItem('invoiceCounterEfectivo', invoiceCounterEfectivo);
    } else {
        invoiceNumber = `FAC-${String(invoiceCounterNormal).padStart(5, '0')}`;
        invoiceCounterNormal++;
        localStorage.setItem('invoiceCounterNormal', invoiceCounterNormal);
    }
    document.getElementById('invoiceNumber').innerText = `Número de Factura: ${invoiceNumber}`;
    document.getElementById('invoiceDate').innerText = `Fecha: ${date}`;
    document.getElementById('invoiceClient').innerText = `Cliente: ${clientName}`;
    document.getElementById('invoiceTotal').innerText = `Total a pagar: ${totalPrice}€`;
    document.getElementById('invoicePaymentMethod').innerText = `Método de Pago: ${paymentMethod}`;
    document.getElementById('invoiceObservations').innerText = `${observations}`;

    const tableBody = document.getElementById('invoiceTableBody');
    tableBody.innerHTML = '';
    document.querySelectorAll('.product-item').forEach(item => {
        const product = item.querySelector('.product').value;
        const quantity = item.querySelector('.quantity').value;
        const unitPrice = item.querySelector('.unitPrice').value;
        tableBody.innerHTML += `<tr><td>${quantity}</td><td>${product}</td><td>${unitPrice}€</td><td>${(quantity * unitPrice).toFixed(2)}€</td></tr>`;
    });

    document.getElementById('invoicePreview').style.display = "block";
}

// **Actualitza el número de factura segons el mètode de pagament seleccionat**
function updateInvoiceNumber() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    let invoiceNumber;

    if (paymentMethod === "Efectivo*") {
        invoiceNumber = `FACT-1-${String(invoiceCounterEfectivo).padStart(5, '0')}`;
    } else {
        invoiceNumber = `FAC-${String(invoiceCounterNormal).padStart(5, '0')}`;
    }

    document.getElementById('invoiceNumber').innerText = `Número de Factura: ${invoiceNumber}`;
}

//  **Funcions per reiniciar comptadors**
function resetInvoiceCounter(type) {
    if (type === 'normal') {
        localStorage.setItem('invoiceCounterNormal', 1);
        invoiceCounterNormal = 1;
        alert("El contador de facturas normales (FAC-) se ha reiniciado.");
    } else if (type === 'efectivo') {
        localStorage.setItem('invoiceCounterEfectivo', 1);
        invoiceCounterEfectivo = 1;
        alert("El contador de facturas Efectivo* (FACT-1-) se ha reiniciado.");
    }
    updateInvoiceNumber();
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obté les dades de la factura
    const invoiceNumber = document.getElementById('invoiceNumber').innerText.replace("Número de Factura: ", "");
    const date = document.getElementById('invoiceDate').innerText.replace("Fecha: ", "");
    const client = document.getElementById('invoiceClient').innerText.replace("Cliente: ", "");
    const paymentMethod = document.getElementById('invoicePaymentMethod').innerText.replace("Método de Pago: ", "");
    const totalAmount = document.getElementById('invoiceTotal').innerText.replace("Total a pagar: ", "");
    const observations = document.getElementById('invoiceObservations').innerText.replace("Observaciones: ", "");

    // Afegir logo
    const img = new Image();
    img.src = "logo.png";

    img.onload = function () {
        doc.addImage(img, 'PNG', 15, 10, 30, 30);

        // Informació de l'empresa
        doc.setFontSize(14);
        doc.text("Factura - PEPEACADEMY", 60, 20);
        doc.text("CIF: 123456789A", 60, 30);
        doc.text("Dirección: Calle Pelayo", 60, 40);
        doc.text("Teléfono: 639123123", 60, 50);
        doc.line(15, 55, 195, 55);

        let y = 70;
        doc.text(`Número de Factura: ${invoiceNumber}`, 15, y);
        doc.text(`Fecha: ${date}`, 15, y + 10);
        doc.text(`Cliente: ${client}`, 15, y + 20);
        doc.text(`Método de Pago: ${paymentMethod}`, 15, y + 30);

        y += 40;

        // Crear la taula amb els productes
        const tableData = [];
        document.querySelectorAll('#invoiceTableBody tr').forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                rowData.push(cell.innerText);
            });
            tableData.push(rowData);
        });

        doc.autoTable({
            startY: y,
            head: [['Cantidad', 'Producto', 'Precio Unitario', 'Total']],
            body: tableData
        });

        y = doc.lastAutoTable.finalY + 10;

        // Afegir total i observacions
        doc.text(totalAmount, 15, y);
        doc.text(`${observations}`, 15, y + 10);

        // Generar el nom del fitxer PDF
        const today = new Date().toISOString().split('T')[0];
        const filename = `Factura_${invoiceNumber}_${today}.pdf`;

        doc.save(filename);
    };

    img.onerror = function () {
        alert("Error cargando el logo. Asegúrate de que 'logo.png' existe en la carpeta del proyecto.");
    };
}
