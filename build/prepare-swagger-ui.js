const fs = require('fs');
const path = require('path');
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath();
const STATIC_DIR = './static';

(async () => {
  try {
    const files = await fs.promises.readdir(STATIC_DIR);
    await Promise.all(
      files.map(async (file) => {
        try {
          if (file !== '.gitkeep') {
            const p = path.join(STATIC_DIR, file);
            await fs.promises.unlink(p);
          }
        } catch (err) {
          // do nothing, file not exists
        }
      }),
    );
  } catch (ex) {
    // do nothing, directory not exists
  }
  
  const copyArray = [
    'favicon-16x16.png',
    'favicon-32x32.png',
    'index.html',
    'oauth2-redirect.html',
    'swagger-ui-bundle.js',
    'swagger-ui-bundle.js.map',
    'swagger-ui-standalone-preset.js',
    'swagger-ui-standalone-preset.js.map',
    'swagger-ui.css',
    'swagger-ui.css.map',
    'swagger-ui.js',
    'swagger-ui.js.map',
    'index.css'
  ]

  for (let i = 0; i < copyArray.length; i++) {
    await fs.promises.copyFile(`${swaggerUiAssetPath}/${copyArray[i]}`, `${STATIC_DIR}/${copyArray[i]}`)
  }

  const newIndex = await fs.promises.readFile(path.resolve(`${STATIC_DIR}/index.html`), 'utf-8');

  await fs.promises.copyFile(`${__dirname}/../node_modules/redoc/bundles/redoc.standalone.js`, `${STATIC_DIR}/redoc.standalone.js` );

  await fs.promises.writeFile(path.resolve(`${STATIC_DIR}/docs.html`), `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Docs</title>
      </head>
      <body>
        <redoc spec-url="./json"></redoc>
        <script src="./redoc.standalone.js"> </script>
      </body>
    </html>
  `);


  fs.promises.writeFile(path.resolve(`${STATIC_DIR}/swagger-initializer.js`), `
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: './json',
        validatorUrl: null,
        oauth2RedirectUrl: './oauth2-redirect.html',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  `)
})();
