const postcssImport = require('postcss-import');
const apply = require('postcss-apply');
const postcssNested = require('postcss-nested');
const postcssAdvancedVariables = require('postcss-advanced-variables');
const postcssPresetEnv = require('postcss-preset-env');
const px2rem = require('postcss-px2rem');
const postCssColorTheme = require('./plugin/postcss/postcss-theme-colors');
const  {colors, groups} = require('./src/common/theme/index');

module.exports = {
  plugins: [
    postcssImport(), // @import
    apply(), // 使用样式集
    postcssAdvancedVariables(), // sass的变量、条件、迭代器
    postcssPresetEnv({
      browsers: ['last 3 versions', 'Android >= 4.0'],
    }),
    postCssColorTheme({colors, groups}), // 主题切换
    postcssNested({
      preserveEmpty: true,
    }), // sass的嵌套规则
    px2rem({
      remUnit: 75,
      threeVersion: true,
    })
  ],
}
