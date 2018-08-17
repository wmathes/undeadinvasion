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
                name: "app",
                main: "app.js",
            },
            plugins: [
                JSONPlugin(),
                isProduction && QuantumPlugin({
                    bakeApiIntoBundle: true,
                    replaceProcessEnv : false,
                    target: "browser",
                    treeshake: true,
                    uglify: false
                }),
            ]
        });
    }
});


task("app", async context => {
    const fuse = context.getConfig(true);
    fuse.bundle("app")
        .globals({
            "app": "*"
        })
        .instructions("> app.ts");
    await fuse.run()
});


task("clean", async context => {
    await src(`./${buildPath}`)
        .clean(`${buildPath}/`)
        .exec();
});

task("copy-assets", async context => {
    fs.ensureDirSync(path.join(__dirname, buildPath));
    fs.copyFileSync(
        path.join(__dirname, "src", "index.html"),
        path.join(__dirname, buildPath, "index.html")
    );

   await src('./assets/**/*')
       .dest(`${buildPath}/`)
       .exec();
});

task("app-proxy", context => {
    fs.writeFileSync(
        path.join(__dirname, buildPath, "app-proxy.js"),
        `require('./app'); module.exports = $fsx.r(0);`
    );
});

task("watch", async context => {
    const fuse = context.getConfig(true);
    fuse.bundle("app")
        .globals({
            "app": "*"
        })
        .watch()
        .instructions("> app.ts");
    await fuse.run()
});

task("serve", async context => {
    const fuse = context.getConfig();
    fuse.dev({
        open: "http://localhost:4444/"
    });
    await fuse.run();
});

task('dev', ['clean', 'copy-assets', 'watch', 'serve'], () => {
});

task('default', ['clean', 'copy-assets', 'app', 'app-proxy'], () => {
});
