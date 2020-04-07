// @ts-check
const { TypeScriptPlugin } = require('dprint-plugin-typescript')
const { JsoncPlugin } = require('dprint-plugin-jsonc')

/** @type { import("dprint").Configuration } */
module.exports.config = {
  projectType: 'openSource',
  indentWidth: 2,
  plugins: [
    new TypeScriptPlugin({
      semiColons: 'asi',
      quoteStyle: 'preferSingle',
      'arrowFunction.useParentheses': 'force',
      'constructor.spaceBeforeParentheses': true,
      'constructorType.spaceAfterNewKeyword': true,
      'method.spaceBeforeParentheses': true,
      'getAccessor.spaceBeforeParentheses': true,
      'setAccessor.spaceBeforeParentheses': true,
      'functionDeclaration.spaceBeforeParentheses': true,
    }),
    new JsoncPlugin({
      indentWidth: 2,
    }),
  ],
  includes: ['**/*.{ts,tsx,json,js,jsx}'],
}
