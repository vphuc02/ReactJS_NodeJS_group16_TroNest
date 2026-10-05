module.exports = [
  {
    ignores: ['node_modules/**', 'public/uploads/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error'
    }
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        AOS: 'readonly',
        Chart: 'readonly',
        FilePond: 'readonly',
        FilePondPluginFileValidateType: 'readonly',
        FilePondPluginImagePreview: 'readonly',
        FormData: 'readonly',
        JustValidate: 'readonly',
        Notyf: 'readonly',
        Swiper: 'readonly',
        URL: 'readonly',
        Headers: 'readonly',
        Viewer: 'readonly',
        clearInterval: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        location: 'readonly',
        notyf: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly'
      }
    }
  }
];
