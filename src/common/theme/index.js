const { backgroundColor, backgroundColorDefault } = require('./backgroundColor');
const { fontColor,fontColorDefault } = require('./fontColor');

let groups = {};
let colors = { ...backgroundColor, ...fontColor };

Object.keys(backgroundColorDefault).forEach((item) => {
  groups[item] = [item, `${item}-dark`];
});

Object.keys(fontColorDefault).forEach((item) => {
  groups[item] = [item, `${item}-dark`];
});

module.exports = {
  groups, // 对应组合
  colors // 全部颜色
}