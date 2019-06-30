## Docker para Mobilenet TF + JS

En esta imagen de docker se incluye todas las herramientas de 
[mobilenet](https://ai.googleblog.com/2017/06/mobilenets-open-source-models-for.html).

### Que hay dentro del Docker?
  
La base de esta imagen de docker es esta 
`openwhisk/action-nodejs-v8:latest`  
la cual es parte de las cloud functions serverless de [ibmcloud](https://console.bluemix.net/openwhisk/)'s.
  
La idea es usar esta imagen para utilizar las capacidades serverless 
de ibm cloud de montar toda la arquitectura y plataforma por nosotros 
mientras solo nos preocupamos por hacer llamadas REST.
  
Primero tenemos que tener instaladas las librerias dentro de Docker  
`RUN npm install @tensorflow/tfjs @tensorflow-models/mobilenet @tensorflow/tfjs-node jpeg-js`.
  
luego copiamos los modelos enteros para que node los pueda utilizar  
`COPY mobilenet mobilenet`.
  
### Instructions for running as a cloud function
  
1. Build:  
```docker build -t tfjs .```
  
2. Log in en [docker hub](https://hub.docker.com/):  
```docker login```
  
3. Taggea la imagen que haz creado en el paso 1 [reemplaza <USERNAME> con tu usuario de docker hub]:  
```docker tag tfjs <USERNAME>/action-nodejs-v8:tfjs```  
  
4. Push:  
```docker push <USERNAME>/action-nodejs-v8:tfjs```  
  
5. Asegurate de que [existe](https://hub.docker.com/r/rvegas/action-nodejs-v8/) la imagen que has creado.  
  
6. Instala el[ibmcloud CLI tool](https://console.bluemix.net/openwhisk/learn/cli).  
  7.1. ```tar -xzf IBM_Cloud_CLI_0.14.0_amd64.tar.gz```  
  7.2. ```cd Bluemix_CLI```  
  7.3. ```sudo ./install```  
  
7. Instala el cloud functions plugin:  
```ibmcloud plugin install cloud-functions```  
  
8. Login en ibm [Presta atencion a las regiones]:  
```ibmcloud login -a cloud.ibm.com -o "ricardovegas@gmail.com" -s "dev"```  
  9.1. En caso de error sobre region, revisa [aqui](https://console.bluemix.net/account/organizations/)  
  
9. Crea un cloud action (serverless cloud function):  
```ibmcloud fn action create classify --docker rvegas/action-nodejs-v8:tfjs index.js```  
  
10. Asegurate de que se ha creado en tu [dashboard](https://console.bluemix.net/openwhisk/actions)  
  
11. Finalmente puedes invocarla via CLI, escoge una imagen:  
```ibmcloud fn action invoke classify -r -p image $(base64 ../panda.jpg)```  
  
12. Si el encoding de la imagen puedes pasarla a base 64 con [esto](https://www.browserling.com/tools/image-to-base64)  
  12.1. Puedes invocar la funcion con cURL y Postman si lo deseas.  
  12.2. Imagenes para prueba [aqui](https://picsum.photos/).  
  
13. Si has hecho todo bien deberias recibir esto:  
```
{
    "activationId": "a976d55d128b4413b6d55d128bc41333",
    "annotations": [
        {
            "key": "path",
            "value": "ricardovegas@gmail.com_dev/classify3"
        },
        {
            "key": "waitTime",
            "value": 1600
        },
        {
            "key": "kind",
            "value": "blackbox"
        },
        {
            "key": "limits",
            "value": {
                "concurrency": 1,
                "logs": 10,
                "memory": 256,
                "timeout": 60000
            }
        },
        {
            "key": "initTime",
            "value": 562
        }
    ],
    "duration": 1137,
    "end": 1551262484334,
    "logs": [],
    "name": "classify3",
    "namespace": "ricardovegas@gmail.com_dev",
    "publish": false,
    "response": {
        "result": {
            "results": [
                {
                    "className": "notebook, notebook computer",
                    "probability": 0.8737973570823669
                },
                {
                    "className": "laptop, laptop computer",
                    "probability": 0.03772661089897156
                },
                {
                    "className": "desktop computer",
                    "probability": 0.02912907674908638
                }
            ]
        },
        "status": "success",
        "success": true
    },
    "start": 1551262483197,
    "subject": "ricardovegas@gmail.com",
    "version": "0.0.1"
}
```
