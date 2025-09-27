---
title: 工程基础配置
date: 2025-6-29
updated: 2025-6-29
categories: profile
excerpt_type: html
tags:
  -	profile
top: 1
---

### 一些脚手架基础配置

- vscode settings
- eslint -v9
- eslint -nuxt -v9
- commitlint
- husky
- lint-staged
- 自定义eslint 规则

<!-- more -->

### vscode settings

保存的时候自动格式化（非 prettier 格式化）

```json [settings.json]{3}
settings.json

{
  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // Silent the stylistic rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "svelte",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
}

```

### eslint config

使用 antfu 的 eslint 配置;

使用 `stylelistic` 作为格式化;

`prettier` 格式化 `stylelistic` 不支持的文件格式, e.g. `css` 文件;

> pnpm i @antfu/eslint-config eslint-plugin-format -D

```js [eslint.config.js]
eslint.config.js

import antfu from '@antfu/eslint-config'
export default antfu(
  {
    vue: true,
    rules: {
      'no-console': 'off',
      'vue/block-order': 'off',
      'antfu/top-level-function': 'off',
      'vue/component-name-in-template-casing': ['error', 'kebab-case', {
        registeredComponentsOnly: false,
      }],
      'vue/no-mutating-props': 'off',
      'ts/no-use-before-define': 'off',
      'ts/no-this-alias': 'off', // components : 组件复用，会有选项式api用法 - 允许this
      'eslint-comments/no-unlimited-disable': 'off',
      'import/no-unused-modules': 'error',
      'unused-imports/no-unused-imports': 'error',
    },
    formatters: {
      css: true,//css使用prettier 格式化
    },
  }
)


```

### eslint config for Nuxt

同样使用 上述 `.vsocde/settings.json`

> pnpm i @nuxt/eslint eslint-plugin-format eslint -D
```js [eslint.config.js]
eslint.config.js

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': 'off',
    'vue/block-order': 'off',
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      {
        registeredComponentsOnly: false,
      },
    ],
    'vue/no-mutating-props': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-this-alias': 'off', // components : 组件复用，会有选项式api用法 - 允许this
    'eslint-comments/no-unlimited-disable': 'off',
  },
})

```

```js
nuxt.conig.ts

export default defineNuxtConfig({
  //...
  modules: ['@nuxt/eslint'],
  eslint: {
    config: {
      stylistic: true,
      formatters: {
        css: 'prettier',
        html: 'prettier',
      },
    },
  },
  //...
})

```

### 自定义eslint rules 


可以尝试将规范结合到 `eslint` 规则中去，比如 🈚️ 滥用 `localStorage`

同时支持 `.{js,ts}`

> pnpm i -D @typescript-eslint/parser

```js
import tsEslintParaser from '@typescript-eslint/parser'
// 自定义eslint 规则做规范～ e.g: 禁止localStorage泛用，而应该模块化集中管理
const plugin = {
  meta: {
    name: 'eslint-plugin-booking',
  },
  configs: {},
  rules: {
    'no-localstorage': {
      meta: {
        schema: [
          {
            type: 'object',
            properties: {
              msg: { type: 'string' },
            },
            additionalProperties: false,
          },
        ],
      },

      create(context) {
        const option = context.options[0]

        return {
          MemberExpression(node) {
            let objectName
            if (node.object.type === 'Identifier') {
              objectName = node.object.name
            }
            else if (
              node.object.type === 'TSAsExpression'
              && node.object.expression.type === 'Identifier'
            ) {
              objectName = node.object.expression.name
            }
            else if (
              node.object.type === 'MemberExpression'
              && node.object.object.type === 'Identifier'
              && node.object.object.name === 'window'
              && node.object.property.type === 'Identifier'
              && node.object.property.name === 'localStorage'
            ) {
              objectName = 'window.localStorage'
            }

            if (objectName === 'localStorage' || objectName === 'window.localStorage') {
              context.report({
                node,
                message: `(订舱eslint): ${option.msg}.`,
              })
            }
          },

        }
      },

    },
  },
}

/**
 * @param {object} options - 配置项
 * @param {string} options.msg - report 消息
 * @param {Array<string>} options.ignores - 忽略模块
 * @returns {Array<object>} ESLint Flat Config 配置数组
 */
const createLocalEslintRule = (options) => {
  const { msg = '', ignores = [] } = options
  return [
    {
      files: ['**/*.{js,ts,jsx,tsx}'],
      languageOptions: {
        parser: tsEslintParaser,
      },
      plugins: {
        '@booking-eslint': plugin,
      },
      rules: {
        '@booking-eslint/no-localstorage': ['error', { msg }],
      },
    },
    {
      files: ignores,
      rules: {
        '@booking-eslint/no-localstorage': 'off',
      },
    },
  ]
}
export default {
  createLocalEslintRule,
}
```

### commitlint & cz-git

> pnpm i @commitlint/cli @commitlint/config-conventional cz-git -D

提供消息格式校验和命令行交互prompt

使用 cli： > npx cz
```js
import { defineConfig } from 'cz-git'

export default defineConfig({
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: 'Select the type of change that you\'re committing:',
      scope: 'Denote the SCOPE of this change (optional):',
      customScope: 'Denote the SCOPE of this change:',
      subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
      body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
      breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
      footerPrefixSelect: 'Select the ISSUES type of changeList by this change (optional):',
      customFooterPrefix: 'Input ISSUES prefix:',
      footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
      generatingByAI: 'Generating your AI commit subject...',
      generatedSelectByAI: 'Select suitable subject by AI generated:',
      confirmCommit: 'Are you sure you want to proceed with the commit above?',
    },
    types: [
      { value: 'feat', name: 'feat:     A new feature', emoji: ':sparkles:' },
      { value: 'fix', name: 'fix:      A bug fix', emoji: ':bug:' },
      { value: 'docs', name: 'docs:     Documentation only changes', emoji: ':memo:' },
      { value: 'style', name: 'style:    Changes that do not affect the meaning of the code', emoji: ':lipstick:' },
      { value: 'refactor', name: 'refactor: A code change that neither fixes a bug nor adds a feature', emoji: ':recycle:' },
      { value: 'perf', name: 'perf:     A code change that improves performance', emoji: ':zap:' },
      { value: 'test', name: 'test:     Adding missing tests or correcting existing tests', emoji: ':white_check_mark:' },
      { value: 'build', name: 'build:    Changes that affect the build system or external dependencies', emoji: ':package:' },
      { value: 'ci', name: 'ci:       Changes to our CI configuration files and scripts', emoji: ':ferris_wheel:' },
      { value: 'chore', name: 'chore:    Other changes that don\'t modify src or test files', emoji: ':hammer:' },
      { value: 'revert', name: 'revert:   Reverts a previous commit', emoji: ':rewind:' },
    ],
    useEmoji: true,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been processed' }],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
})
```

`package.json` 增加如下
```json
{//[!code ++]
  "config": {//[!code ++]
    "commitizen": {//[!code ++]
      "path": "node_modules/cz-git"//[!code ++]
      }//[!code ++]
  }//[!code ++]
}//[!code ++]

```

### husky & lint-staged

> pnpm i husky lint-staged -D

> npx husky init

在 git hooks `pre-commit` 增加 `eslint` `ts check` 等校验

.husky/pre-commit
```shell
npx lint-staged
```
`package.json` 添加如下
```json
 "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,scss,md,vue}": "eslint --fix"
  }
```
校验 `commit-msg`:


.husky/commit-msg
```shell
npx --no -- commitlint --edit $1 
```

