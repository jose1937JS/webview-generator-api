const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const https = require("https");

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/listar', function(req, res, next) {
  const ls = fs.readdirSync('webview/android');
  console.log(JSON.stringify(ls, null, 4));
  
  res.json(ls);  
});

router.get('/update-file', function(req, res, next) {
  // Leer el contenido del archivo

  const rutaArchivo = "./project/App.tsx";

  fs.readFile(rutaArchivo, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
    } else {
      // Reemplazar la palabra antigua por la nueva en el contenido
      const contenidoModificado = data.replace('https://www.youtube.com/', 'https://www.mercadolibre.com.ve/');

      // Escribir el contenido modificado en el archivo
      fs.writeFile(rutaArchivo, contenidoModificado, 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir en el archivo:', err);
        } else {
          console.log('Contenido Actualizado Correctamente');
        }
      });
    }
  })
});

router.get('/listar', function(req, res, next) {
  const ls = fs.readdirSync('webview/android');
  console.log(JSON.stringify(ls, null, 4));
  
  res.json(ls);  
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
