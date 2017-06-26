##### How to publish to NPM repository

```bash
npm version patch

git tag -s "v{version}" -m "v{version}"

git push --tags

git checkout v{version} 

npm login --scope=@senzil

npm publish @senzil/cec-monitor --access public

```