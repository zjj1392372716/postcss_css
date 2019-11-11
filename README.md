
## postcss 插件

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