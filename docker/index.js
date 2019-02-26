const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
require('@tensorflow/tfjs-node')

const jpeg = require('jpeg-js');

const NUMBER_OF_CHANNELS = 3
const MODEL_PATH = 'mobilenet/model.json'

let mn_model

const memoryUsage = () => {
  let used = process.memoryUsage();
  const values = []
  for (let key in used) {
    values.push(`${key}=${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }

  return `memory used: ${values.join(', ')}`
}

const logTimeAndMemory = label => {
  console.timeEnd(label)
  console.log(memoryUsage())
}

const decodeImage = source => {
  console.time('decodeImage');
  const buf = Buffer.from(source, 'base64')
  const pixels = jpeg.decode(buf, true);
  logTimeAndMemory('decodeImage')
  return pixels
}

const imageByteArray = (image, numChannels) => {
  console.time('imageByteArray');
  const pixels = image.data
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  logTimeAndMemory('imageByteArray')
  return values
}

const imageToInput = (image, numChannels) => {
  console.time('imageToInput');
  const values = imageByteArray(image, numChannels)
  const outShape = [image.height, image.width, numChannels];
  const input = tf.tensor3d(values, outShape, 'int32');

  logTimeAndMemory('imageToInput')
  return input
}

const loadModel = async path => {
  console.time('loadModel');
  const mn = new mobilenet.MobileNet(1, 1);
  mn.path = `file://${path}`
  await mn.load()
  logTimeAndMemory('loadModel')
  return mn
}

async function main (params) {
  console.time('main');
  console.log('prediction function called.')
  console.log(memoryUsage())

  console.log('loading image and model...')

  const image = decodeImage(params.image)
  const input = imageToInput(image, NUMBER_OF_CHANNELS)

  if (!mn_model) {
    mn_model = await loadModel(MODEL_PATH)
  }

  console.time('mn_model.classify');
  const predictions = await mn_model.classify(input);
  logTimeAndMemory('mn_model.classify')

  console.log('classification results:', predictions);

  // free memory from TF-internal libraries from input image
  input.dispose()
  logTimeAndMemory('main')

  return { results: predictions }
}
