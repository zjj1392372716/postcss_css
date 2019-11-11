
# 03. PostCSS 初识
> PostCSS 是一款用js插件来处理CSS的工具。同我们使用的sass、less 有相似之处，但是也有很多它自己独特的优势。

PostCSS对css的转换与处理，依赖于插件，当下它已经拥有了很多插件，同时我们也可以自定义自己的插件，以我们自己的方式去处理CSS。

它可以作为一款 CSS 前置处理器( preprocessor ) 使用, 就像 Sass 和 Less 等一样，使用 `postcss-simple-vars`, `postcss-mixins`, `postcss-nested`, `postcss-sass-extend`等插件来实现 Sass 提供的 变量， mixin，选择器嵌套，extend 等功能。如果你不想自己配置，也可以使用一款已经打包好这些功能， 语法与 Sass 相似的插件precss 来实现preprocessor。

1. PostCSS 速度提升3倍以上
2. PostCSS 能定制自己要用到的某几样功能，不至于像我们仅仅使用了变量就引入了Sass
3. 插件很强大

## 谈谈我自己使用 PostCSS的理由

1. PostCSS 速度相比于 Sass 等与预理器来说提升了很大
2. Sass 这种预处理器已经成为我们开发中必不可少的一种工具，但是它内部的一些功能我们可能都不会使用到，假如只是为了使用变量，就引入Sass 那是非常的不划算的
3. Sass 已经被定义好了，而Postcss 可以允许我们自定义自己的CSS处理方式，更为灵活
4. 我们可以借助PostCSS只实现一些我们用得到的东西。

## webpack 中怎么使用
```js
const path = require("path")

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/index.js")
  },
  mode: 'development',
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist")
  },
  module: {
    rules: [
      {
        test: /\.pcss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    compress: true,
    port: 9000,
    inline: true,
    hot: true,
    host: '0.0.0.0',
    disableHostCheck: true
  }
}
```

```js
// postcss.config.js
const postcss = require('./config/postcss');
const postcssThemeColors = require('postcss-theme-colors');
const  {colors, groups} = require('./src/common/theme/index');
const postCssConfig = postcss.h5;
postCssConfig.plugins.push(postcssThemeColors({ colors, groups }));

module.exports = postCssConfig;
```

```js
// postcss.config.js
const postcssImport = require('postcss-import');
const apply = require('postcss-apply');
const postcssNested = require('postcss-nested');
const postcssAdvancedVariables = require('postcss-advanced-variables');
const postcssPresetEnv = require('postcss-preset-env');
const px2rem = require('postcss-px2rem');

module.exports = {
  plugins: [
    postcssImport(), // @import
    apply(), // 使用样式集
    postcssNested({
      preserveEmpty: true,
    }), // sass的嵌套规则
    postcssAdvancedVariables(), // sass的变量、条件、迭代器
    postcssPresetEnv({
      browsers: ['last 3 versions', 'Android >= 4.0'],
    }),
    px2rem({
      remUnit: 75,
      threeVersion: true,
    })
  ],
}
```

> PostCSS 主要依赖各种插件去处理我们的css，可以是官网提供的插件也可以自定义插件。

## 以主题切换为例学习
这里的主题切换采用的是一个 `postcss-theme-colors` 插件。那么如何自定义一个自己的postcss插件呢？

[](https://ask.qcloudimg.com/http-save/yehe-110536/rq3myvj0l7.png?imageView2/2/w/1620)

> 以上是一张官方提供的原理图：原理好理解，首先拿到上一步传入的 CSS ，然后根据一定的rule 解析(Parser)成一个 节点树。然后借助于插件进行处理转换，并最终通过 Stringifier 进行拼接，最终生成新的 CSS。source map则记录了前后的对应关系。

### 插件命名

插件按照规范我们以 `postcss-` 开头。

### 通过 postcss.plugin创建插件

```sh
module.exports = postcss.plugin('plugin-name', function (opts){
	  // opts 选项处理
    return function (root, result) {
    		// 插件代码，转换CSS的功能代码
    };
});
```

### 认识几个概念root(css),rule, nodes, decl, prop, value

* root(css)
> 整个CSS代码段，包含多个rule

```css
.demo {
  width: 10vw;
}
.demo1 {
  width: 10vw;
}
```

* rule
> 包含一个class 范围内的代码段

```css
.demo {
  width: 10vw;
}
```

* nodes 
> 代指rule 中{ }中间的多个 decl 部分。

* decl 
> 单行CSS

* prop
> 单行CSS 上的属性

* value
> 单行CSS上的值

### API

* walkRules 遍历所有rule，第一个参数接受正则，表示只匹配符合的规则，第二个参数是callback，返回当前正在处理的rule
* walkDecls，遍历所有decl，参数是callback，返回当前正在处理的decl

### 代码为例子：

```js
const postcss = require('postcss')

const defaults = {
  function: 'cc',
  groups: {},
  colors: {},
  useCustomProperties: false,
  darkThemeSelector: 'html[data-theme="dark"]',
  nestingPlugin: null
}

const resolveColor = (options, theme, group, defaultValue) => {
  const [lightColor, darkColor] = options.groups[group] || []
  const color = theme === 'dark' ? darkColor : lightColor
  if (!color) {
    return defaultValue
  }

  if (options.useCustomProperties) {
    return color.startsWith('--') ? `var(${color})` : `var(--${color})`
  }

  return options.colors[color] || defaultValue
}

module.exports = postcss.plugin('postcss-theme-colors', options => {
  options = Object.assign({}, defaults, options)
  const reGroup = new RegExp(`\\b${options.function}\\(([^)]+)\\)`, 'g')

  return (style, result) => {
    const hasPlugin = name =>
      name.replace(/^postcss-/, '') === options.nestingPlugin ||
      result.processor.plugins.some(p => p.postcssPlugin === name)

    style.walkDecls(decl => {
      // decl 为 CSS单行  | 如：color: cc[bg-ffffff];
      const value = decl.value
      if (!value || !reGroup.test(value)) {
        return
      }

      // 取得 正常模式 下的值
      const lightValue = value.replace(reGroup, (match, group) => {
        return resolveColor(options, 'light', group, match)
      })

      if (lightValue === value) {
        decl.warn(result, `Group not found: \`${value}\``)
        return
      }

      // 取得 黑夜模式 下的值
      const darkValue = value.replace(reGroup, (match, group) => {
        return resolveColor(options, 'dark', group, match)
      })

      // 克隆一份，值改为 黑夜模式的值
      const darkDecl = decl.clone({ value: darkValue }) // 此时 darkDecl => color: #000000;

      let darkRule
      // 黑夜模式的前缀规则
      if (hasPlugin('postcss-nesting')) {
        darkRule = postcss.atRule({
          name: 'nest',
          params: `${options.darkThemeSelector} &`
        })
      } else if (hasPlugin('postcss-nested')) {
        darkRule = postcss.rule({
          selector: `${options.darkThemeSelector} &`
        })
      } else {
        decl.warn(result, `Plugin(postcss-nesting or postcss-nested) not found`)
      }

      if (darkRule) {
        darkRule.append(darkDecl)
        decl.parent.append(darkRule)
      }
      
      // 克隆一份 白天模式下的样式
      const lightDecl = decl.clone({ value: lightValue }) // 此时 lightDecl => color: #ffffff;
      decl.replaceWith(lightDecl) // 替换旧的规则
    })
  }
})
```

### 使用案例

```js
const postcssImport = require('postcss-import');
const apply = require('postcss-apply');
const postcssNested = require('postcss-nested');
const postcssAdvancedVariables = require('postcss-advanced-variables');
const postcssPresetEnv = require('postcss-preset-env');
const px2rem = require('postcss-px2rem');
const postcssThemeColors = require('postcss-theme-colors');
const colors = {
  C01: 'pink',
  C02: '#111',
}
 
const groups = {
  G01: ['C01', 'C02'],
}

module.exports = {
  plugins: [
    postcssImport(), // @import
    apply(), // 使用样式集
    postcssAdvancedVariables(), // sass的变量、条件、迭代器
    postcssPresetEnv({
      browsers: ['last 3 versions', 'Android >= 4.0'],
    }),
    postcssThemeColors({colors, groups}),
    postcssNested({
      preserveEmpty: true,
    }), // sass的嵌套规则
    px2rem({
      remUnit: 75,
      threeVersion: true,
    })
  ],
}
```

```css
@import './common/style/common.pcss';
$toolBarColor: pink;
.tools {
  color: red;
  .bar {
    font-size: 30px;
    color: cc(G01);
  }
}
```


## 使用到的postcss 插件

### 1、postcss-apply

> PostCSS plugin enabling custom property sets references [能过允许我们自定义属性集]

* 在CSS中使用

```css
:root {
  --toolbar-theme: {
    background-color: rebeccapurple;
    color: white;
    border: 1px solid green;
  };
}

.tool {
  @apply --toolbar-theme;
}
```

输出为：

```css
/* output */

.Toolbar {
  background-color: rebeccapurple;
  color: white;
  border: 1px solid green;
}
```

### 2、postcss-nested

> PostCSS plugin to unwrap nested rules like how Sass does it.可以帮助我们解开嵌套规则,如Sass一样

```css
.phone {
    &_title {
        width: 500px;
        @media (max-width: 500px) {
            width: auto;
        }
        body.is_dark & {
            color: white;
        }
    }
    img {
        display: block;
    }
}

.title {
  font-size: var(--font);

  @at-root html {
      --font: 16px
    }
  }
}
```
输出后：
```css
.phone_title {
    width: 500px;
}
@media (max-width: 500px) {
    .phone_title {
        width: auto;
    }
}
body.is_dark .phone_title {
    color: white;
}
.phone img {
    display: block;
}

.title {
  font-size: var(--font);
}
html {
  --font: 16px
}
```

### 3、postcss-apply

> PostCSS plugin to inline @import rules content 允许我们@import引入样式。


### 4、postcss-advanced-variables

> PostCSS Advanced Variables lets you use Sass-like variables, conditionals, and iterators in CSS. 允许我们使用Sass中的变量、选择、迭代器。

```scss
$dir: assets/icons;
 
@each $icon in (foo, bar, baz) {
  .icon-$icon {
    background: url('$dir/$icon.png');
  }
}
 
@for $count from 1 to 5 by 2 {
  @if $count > 2 {
    .col-$count {
      width: #{$count}0%;
    }
  }
}
 
@import "path/to/some-file";
 
/* after */
 
.icon-foo {
  background: url('assets/icons/foo.png');
}
 
.icon-bar {
  background: url('assets/icons/bar.png');
}
 
.icon-baz {
  background: url('assets/icons/baz.png');
}
 
.col-3 {
  width: 30%;
}
 
.col-5 {
  width: 50%;
}
```

### 5、postcss-px2rem

> px 到 rem 的转换


### 4、postcss-preset-env

> postcss-preset-env 使您可以将现代CSS转换为大多数浏览器可以理解的内容，并根据目标浏览器或运行时环境确定所需的polyfill。

```css
@custom-media --viewport-medium (width <= 50rem);
@custom-selector :--heading h1, h2, h3, h4, h5, h6;
:root {
  --mainColor: #12345678;
}

body {
  color: var(--mainColor);
  font-family: system-ui;
  overflow-wrap: break-word;
}
:--heading {
  background-image: image-set(url(img/heading.png) 1x, url(img/heading@2x.png) 2x);

  @media (--viewport-medium) {
    margin-block: 0;
  }
}
```

```css
:root {
  --fontSize: 1rem;
  --mainColor: rgba(18,52,86,0.47059);
  --secondaryColor: rgba(102, 51, 153, 0.9);
}

html {
  overflow-x: hidden;
  overflow-y: auto;
  overflow: hidden auto;
}

@media (max-width: 50rem) {
  body {
    color: var(--mainColor);
    font-family: system-ui;
    font-size: var(--fontSize);
    line-height: calc(var(--fontSize) * 1.5);
    overflow-wrap: break-word;
    padding-left: calc(var(--fontSize) / 2 + 1px);
    padding-right: calc(var(--fontSize) / 2 + 1px);
  }
}

h1,h2,h3,h4,h5,h6 {
  margin-top: 0;
  margin-bottom: 0;
}

```