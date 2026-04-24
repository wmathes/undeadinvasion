/**
 * Semantic-release configuration.
 *
 * Branch strategy:
 *   main - stable releases (2.3.0, 2.3.1, 3.0.0, ...)
 *   next - prereleases (2.4.0-next.1, ...), useful for staging breaking work
 *
 * Plugin chain (all four are bundled with `semantic-release`; no extra
 * devDeps required):
 *   commit-analyzer            - read Conventional Commits, decide bump
 *   release-notes-generator    - generate markdown release notes
 *   npm                        - publish to the npm registry
 *   github                     - create a GitHub Release + attach the bundle zip
 *
 * If you ever want a CHANGELOG.md committed back to the repo, add
 *   @semantic-release/changelog + @semantic-release/git to the chain.
 * Kept out of scope for now - GitHub Releases already expose the notes.
 *
 * See https://semantic-release.gitbook.io/semantic-release/usage/configuration
 */

/** @type {import('semantic-release').GlobalConfig} */
export default {
    branches: ["main", { name: "next", prerelease: true }],
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/npm",
        [
            "@semantic-release/github",
            {
                assets: [
                    {
                        path: "release-assets/undeadinvasion-bundle.zip",
                        label: "Game bundle (${nextRelease.version})",
                        name: "undeadinvasion-${nextRelease.version}.zip",
                    },
                ],
            },
        ],
    ],
};
