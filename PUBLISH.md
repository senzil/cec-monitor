##### How to publish to NPM repository

```bash
npm --sign-git-tag version patch

git push --tags

git checkout v{version} 

npm login --scope=@senzil

npm publish --access public

git checkout versionbranch

```