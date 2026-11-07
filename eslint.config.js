const globals = {
  // Node globals for backend
  node: {
    console: 'readonly',
    module: 'readonly',
    require: 'readonly',
    process: 'readonly',
    __dirname: 'readonly',
    Buffer: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    URL: 'readonly',
    URLSearchParams: 'readonly',
    fetch: 'readonly',
    AbortController: 'readonly',
    FormData: 'readonly',
    Blob: 'readonly'
  },
  // Browser globals for frontend & public scripts
  browser: {
    window: 'readonly',
    document: 'readonly',
    location: 'readonly',
    navigator: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    URL: 'readonly',
    URLSearchParams: 'readonly',
    FormData: 'readonly',
    Blob: 'readonly',
    Headers: 'readonly',
    Event: 'readonly',
    CustomEvent: 'readonly',
    HTMLElement: 'readonly',
    MutationObserver: 'readonly',
    IntersectionObserver: 'readonly',
    ResizeObserver: 'readonly',
    performance: 'readonly',
    FileReader: 'readonly',
    AOS: 'readonly',
    Chart: 'readonly',
    FilePond: 'readonly',
    FilePondPluginFileValidateType: 'readonly',
    FilePondPluginImagePreview: 'readonly',
    JustValidate: 'readonly',
    Notyf: 'readonly',
    notyf: 'readonly',
    Swiper: 'readonly',
    Viewer: 'readonly'
  }
};

module.exports = [
  // 1. Global ignore list - ignore dependencies, build artifacts, and uploaded files
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'frontend/dist/**',
      'frontend/node_modules/**',
      'public/uploads/**',
      '.agents/**',
      '.taste-skill/**',
      '.vscode/**'
    ]
  },

  // 2. Backend JavaScript (CommonJS / Node.js)
  {
    files: [
      'index.js',
      'configs/**/*.js',
      'controllers/**/*.js',
      'helpers/**/*.js',
      'middlewares/**/*.js',
      'models/**/*.js',
      'routers/**/*.js',
      'routes/**/*.js',
      'scripts/**/*.js',
      'seeds/**/*.js',
      'tests/**/*.js',
      'validations/**/*.js'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error'
    }
  },

  // 3. Frontend React / Vite source code (ES Modules & JSX)
  {
    files: ['frontend/src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        React: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'error'
    }
  },

  // 4. Frontend config files (vite.config.js, tailwind.config.js)
  {
    files: ['frontend/*.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error'
    }
  },

  // 5. Public assets scripts
  {
    files: ['public/**/*.js', 'frontend/public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: globals.browser
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error'
    }
  }
];
