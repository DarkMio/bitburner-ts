# Bitburner Scripts + Typescript + Local Server

A Typescript template project with debugging support, import rewrites and developer convenience.

## How to use

1. Transpile/Run Server: `npm run watch`
2. Set an alias once in bitburner: `alias init="wget http://localhost:8000/init.js init.js; wget http://localhost:8000/deployment/self-update.js deployment/self-update.js"`
3. Run in bitburner: `init`

### Requirements

Nodejs >= 10

### Transpiling and Starting Server

Clone this project and on your terminal run:

```bash
# Install dependencies
npm ci
# Transpile the code and start server
npm start
# The server will run locally on port 8000 (default)
```

### Updating your code

The code is being automatically generated and ingame the deployment process will check regularly if any updates are available. It will then download all generated scripts in `./dist/` onto `home` and do a `run processor.js`.

## Contributing

Read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## Code of Conduct

Read the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file for more information.
