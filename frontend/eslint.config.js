import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'jsx-a11y': jsxA11yPlugin,
			'prettier': prettierPlugin,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

			'jsx-a11y/anchor-is-valid': 'error',
			'jsx-a11y/no-noninteractive-element-interactions': 'error',

			'prettier/prettier': 'off'
			// [
			// 	'error',
			// 	{
			// 		useTabs: true,
			// 		tabWidth: 4,
			// 		singleQuote: false,
			// 		jsxSingleQuote: false,
			// 		trailingComma: 'es5',
			// 		endOfLine: 'auto',
			// 	},
			// ],
		},
	},
)