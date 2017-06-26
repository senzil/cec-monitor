##### How to publish to NPM repository

```bash
npm version patch

git push --tags

git checkout v{version} 

npm login --scope=@senzil

npm publish --access public

```