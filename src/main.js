const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const console = require("console");
const { layersOrder, format, rarity } = require("./config.js");
const { log } = require("console");

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");


if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const buildDir = `${process.env.PWD}/build`;
const metDataFile = '_metadata.json';
const layersDir = `${process.env.PWD}/layers`;

let metadata = [];
let attributes = [];
let hash = [];
let decodedHash = [];
let hash_dict = {};

const addRarity = _str => {
  let itemRarity;

  rarity.forEach((r) => {
    if (_str.includes(r.key)) {
      itemRarity = r.val;
    }
  });

  return itemRarity;
};

const cleanName = _str => {
  let name = _str.slice(0, -4);
  rarity.forEach((r) => {
    name = name.replace(r.key, "");
  });
  return name;
};

const getElements = path => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index + 1,
        name: cleanName(i),
        fileName: i,
        rarity: addRarity(i),
      };
    });
};

const layersSetup = layersOrder => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    location: `${layersDir}/${layerObj.name}/`,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    position: { x: 0, y: 0 },
    size: { width: format.width, height: format.height },
    number: layerObj.number
  }));

  return layers;
};

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
};

const saveLayer = (_canvas, _edition) => {
  fs.writeFileSync(`${buildDir}/${_edition}.png`, _canvas.toBuffer("image/png"));
};

const addMetadata = _edition => {
  let dateTime = Date.now();
  let tempMetadata = {
    hash: hash.join(""),
    decodedHash: decodedHash,
    edition: _edition,
    date: dateTime,
    attributes: attributes,
  };
  metadata.push(tempMetadata);
  attributes = [];
  hash = [];
  decodedHash = [];
};

const addAttributes = (_element, _layer) => {
  let tempAttr = {
    id: _element.id,
    layer: _layer.name,
    name: _element.name,
    rarity: _element.rarity,
  };
  attributes.push(tempAttr);
  hash.push(_layer.id);
  hash.push(_element.id);
  decodedHash.push({ [_layer.id]: _element.id });
};

const sequenceLayers = (_layer) => {
  const rand = Math.random();
  const element =
    _layer.elements[Math.floor(rand * _layer.number)] ? _layer.elements[Math.floor(rand * _layer.number)] : null;
  return element;
};

const drawLayer = async (_ls, _edition) => {
 if (_ls && _ls.element) {
    addAttributes(_ls.element, _ls.layer);
    const image = await loadImage(`${_ls.layer.location}${_ls.element.fileName}`);
    ctx.drawImage(
      image,
      _ls.layer.position.x,
      _ls.layer.position.y,
      _ls.layer.size.width,
      _ls.layer.size.height
    );
    saveLayer(canvas, _edition);
  }
};

const createFiles = async (edition) => {
  const layers = layersSetup(layersOrder);

  let counter = 0;

  for (let i = 1; i <= edition; i++) {
    let layerSetup = [];
    let local_hash = [];
    for (const l of layers) {
      const setup = {
        element: sequenceLayers(l),
        layer: l
      }
      local_hash.push(setup.layer.id);
      local_hash.push(setup.element.id);
      layerSetup.push(setup);
    }

    if (!hash_dict[local_hash.join("")]) {
      for (const ls of layerSetup) {
        await drawLayer(ls, i);
      }
      hash_dict[local_hash.join("")] = true;
      addMetadata(i);  
      printNice(i);
    } else {
      i--;
      counter++;
      printNice("       canceled: "+ counter);
    }
  }
};

const createMetaData = () => {
  fs.stat(`${buildDir}/${metDataFile}`, (err) => {
    if(err == null || err.code === 'ENOENT') {
      fs.writeFileSync(`${buildDir}/${metDataFile}`, JSON.stringify(metadata, null, 2));
    } else {
        console.log('Oh no, error: ', err.code);
    }
  });
};

const printNice = (str) => {
  process.stdout.write(`Creating edition: ${str}\r`);
}

module.exports = { buildSetup, createFiles, createMetaData };