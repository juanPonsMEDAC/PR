const express = require('express');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'facturas/' });

app.post('/save-invoice', upload.single('file'), (req, res) => {
    const { filename } = req.body;
    const file = req.file;

    if (!filename || !file) {
        return res.status(400).send({ message: "Error al guardar la factura" });
    }

    const newPath = `facturas/${filename}`;
    fs.renameSync(file.path, newPath);
    res.send({ message: "Factura guardada exitosamente", filename });
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
