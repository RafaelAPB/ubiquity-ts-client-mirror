# Example Project

The main purpose of this project is to show working examples of the usage of the Typescript client.

To run this code directly from Typescript you may need to install ts-node globally
```typescript
npm install -g typescript
npm install -g ts-node
```

you will need to update the .npmrc file with configuration to allow the client to be pulled from the gitlab package repository
```
@ubiquity:registry=https://gitlab.com/api/v4/projects/27274533/packages/npm/
//gitlab.com/api/v4/projects/27274533/packages/npm/:_authToken="AUTH TOKEN HERE"
always-auth=true
```