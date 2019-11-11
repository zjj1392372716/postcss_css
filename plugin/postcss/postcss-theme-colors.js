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
