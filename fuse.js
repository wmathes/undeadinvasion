const {FuseBox, JSONPlugin, QuantumPlugin} = require("fuse-box");
const {src, task, context} = require("fuse-box/sparky");
const path = require("path");
const fs = require("fs-extra");

const buildPath = '.build';

context(class {
    // noinspection JSUnusedGlobalSymbols
    getConfig(isProduction = false) {
        return FuseBox.init({
            homeDir: "src",
            output: `${buildPath}/$name.js`,
            target: "client",
            package: {
                name: "index",
                main: "index.js",
            },
            plugins: [
                JSONPlugin(),
                isProduction && QuantumPlugin({
                    bakeApiIntoBundle: true,
                    replaceProcessEnv : false,
                    target: "npm",
                    treeshake: true,
                    uglify: false
                }),
            ]
        });
    }
});

task("clean", async context => {
    await src(`./${buildPath}`)
        .clean(`${buildPath}/`)
        .exec();
});

task("copy-assets", async context => {
   await src('./assets/**/*')
       .dest(`${buildPath}/`)
       .exec();
});

task("lambda-proxy", context => {
    fs.writeFileSync(
        path.join(__dirname, buildPath, "lambda-proxy.js"),
        `require('./lambda'); module.exports = $fsx.r(0);`
    );
});

task('watch', ['clean', 'cli-watch'], () => {
});

task('default', ['clean', 'copy-assets', 'lambda', 'cli', 'lambda-proxy'], () => {
});
