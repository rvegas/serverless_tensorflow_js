## Docker image for Mobilenet TF + JS

This dockerfile contains the libraries and pre-trained models 
for running prediction-based image classification using 
[mobilenet](https://ai.googleblog.com/2017/06/mobilenets-open-source-models-for.html)'s 
tooling.

### Dockerfile explained
  
The base for this dockerfile is `openwhisk/action-nodejs-v8:latest` which 
is part of [ibmcloud](https://console.bluemix.net/openwhisk/)'s serverless 
cloud functions.
  
The idea is that we use this image in order to be able to execute 
image classification requests via HTTP calls rather than holding the 
whole infrastructure of ML with Tensorflow JS.
  
Next we simply install the necessary libraries to run image classification 
using mobilenet by running `RUN npm install @tensorflow/tfjs @tensorflow-models/mobilenet @tensorflow/tfjs-node jpeg-js`.
  
Finally we copy the entire pretrained models into the corresponding 
directory for our script to run with `COPY mobilenet mobilenet`.
  
### Instructions for running as a cloud function
  
1. If you're not building the image yourself because you don't have 
docker installed, you may skip to step 6.

2. Build the docker image:  
```docker build -t tfjs .```

3. Make sure you're logged in on [docker hub](https://hub.docker.com/):  
```docker login```

4. Tag the image you built in step 2 [replace <USERNAME> with your docker hub username]:  
```docker tag tfjs <USERNAME>/action-nodejs-v8:tfjs```

5. Push the image to your docker hub account [make sure it's public]:  
```docker push <USERNAME>/action-nodejs-v8:tfjs```

6. Make sure the image you're using for the cloud function [exists](https://hub.docker.com/r/rvegas/action-nodejs-v8/)  

7. Install the [ibmcloud CLI tool](https://console.bluemix.net/openwhisk/learn/cli).  
  7.1. ```tar -xzf IBM_Cloud_CLI_0.14.0_amd64.tar.gz```  
  7.2. ```cd Bluemix_CLI```  
  7.3. ```sudo ./install```  
  
8. Install the cloud functions plugin:  
```ibmcloud plugin install cloud-functions```  

9. Login to your ibmcloud account [Be aware of the organization and regions]:    
```ibmcloud login -a cloud.ibm.com -o "ricardovegas@gmail.com" -s "dev"```  

10. Create a cloud action with the cli:  
```ibmcloud fn action create classify --docker rvegas/action-nodejs-v8:tfjs index.js```  

11. Make sure the action is created in your [dashboard](https://console.bluemix.net/openwhisk/actions)  

12. Finally invoke the action with the CLI:  
```ibmcloud fn action invoke classify -r -p image $(base64 ../panda.jpg)```  

13. If step 12 fails due to encoding and command size, you can also do it via postman using 
pages like this:  https://www.browserling.com/tools/image-to-base64  
  13.1. You can also invoke the cloud function via HTTP with curl or postman.  
  
14. If you completed all steps with no issues you should get a response like this:  
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
