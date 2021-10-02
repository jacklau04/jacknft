const layersOrder = [
    { name: 'background', number: 6 },
    { name: 'billboard', number: 4 },
    { name: 'clothes', number: 3 },
    { name: 'bull', number: 3 },
    { name: 'glasses', number: 4 },
    { name: 'hat', number: 7 },
    { name: 'hand-object', number: 4 },
    { name: 'text', number: 6 },
    { name: 'ticker', number: 10 },
];
  
const format = {
    width: 1000,
    height: 1000
};

const rarity = [
    { key: "", val: "original" },
    { key: "_r", val: "rare" },
    { key: "_sr", val: "super rare" },
];

const defaultEdition = 10000;

module.exports = { layersOrder, format, rarity, defaultEdition };