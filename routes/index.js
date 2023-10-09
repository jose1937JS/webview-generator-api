// Pasos para construir el algritmo
// 1. Formulario para donde se obtenga el nombre de la app y el archivo de imagen para usarse como icono
// 1.2. Copiar el proyecto base de RN entero para hacerle las modificaciones pertinentes
// 1.3. Reemplazar la url del webview por la del formulario
// 1.4. Buscar el archivo del nomrbe de la app y Renombrarlo por el del formulario
// 1.5. Buscar todos los archivos del nombre de paquete y renombrarlo a uno que coincida con el del nombre de la app o seleccionarlo del formulario
// 1.6. Modificar el tamano del icono y agregarlo a la carpeta assets de la app
// 1.7.
// 2. Compilar la app e ir retornando el output
// 2.1. descargar el archivo compilado
// 2.2. Eliminar el proyecto al cabo de cierto tiempo

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const Jimp = require('jimp');

const upload = require('../middlewares/upload');

var router = express.Router();

const updateFileContent = (filePath, earlierText, newText) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
    }
    else {
      // Reemplazar la palabra antigua por la nueva en el contenido
      const contenidoModificado = data.replace(earlierText, newText);

      // Escribir el contenido modificado en el archivo
      fs.writeFile(filePath, contenidoModificado, 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir en el archivo:', err);
        } else {
          console.log('Contenido Actualizado Correctamente');
        }
      });
    }
  })
}

/* PROCESS FORM. */
router.post('/process-app', function(req, res, next) {
  const name = req.body.name;
  const package = req.body.package || `com.lopez_app_generator.${name}`;
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'López App Generator' });
});

router.get('/listar', function(req, res, next) {
  const ls = fs.readdirSync('project/android');
  console.log(JSON.stringify(ls, null, 4));

  res.json(ls);
});

router.post('/update-file', upload.single('icon'), async (req, res, next) => {
  const mipmap_folders = [
    {
      name: 'mipmap-hdpi',
      fileDimension: 72
    },
    {
      name: 'mipmap-mdpi',
      fileDimension: 48
    },
    {
      name: 'mipmap-xhdpi',
      fileDimension: 96
    },
    {
      name: 'mipmap-xxhdpi',
      fileDimension: 144
    },
    {
      name: 'mipmap-xxxhdpi',
      fileDimension: 192
    },
  ]

  // const name = req.body.name;
  const file = req.file;
  // const rutaArchivo = "./project/App.tsx";
  // const earlierText = "";
  // const newText = "";

  // Crear iconos con nombre ic_launcher en las carpetas mipmap con sus respectivas dimensiones
  mipmap_folders.map(async (item) => {
    await Jimp.read(file.buffer, (err, image) => {
      if (err) res.status(500).send(err);

      image
        .cover(item.fileDimension, item.fileDimension)
        .quality(50)
        .write(`uploads/${item.name}/ic_launcher.png`);

      res.end();
    });
  });

  // updateFileContent(rutaArchivo, earlierText, newText);
});

router.get('/download', function(req, res, next) {
  const ruta_apk = "./project/android/app/build/outputs/apk/release/app-release.apk";

  fs.access(ruta_apk, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.stat(ruta_apk, (err, stats) => {
        if(!err) {
          console.log("STATS", JSON.stringify(stats.birthtime, null, 4));
          res.download(ruta_apk);
          res.send("Archivo descargado. Fecha de creacion: " + stats.birthtime);
        }
      });
      return;
    }

    console.error('El archivo no existe');
  });
});

router.get('/build', function(req, res, next) {
  const child = exec('cd project && yarn bundle');

  // Mostrar el output a medida que se va ejecutando
  child.stdout.on('data', (data) => {
    console.log(data);
  });

  // Manejar errores
  child.stderr.on('data', (data) => {
    console.error(data);
  });

  // Capturar el evento de finalizacin
  child.on('close', (code) => {
    res.send(`El comando se ha ejecutado con el código de salida ${code}`);
  });

});

module.exports = router;
