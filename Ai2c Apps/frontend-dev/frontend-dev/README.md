# A-MAP (Frontend)

A-MAP is the Aviation Maintainer Analytics Platform

Prerequisites:

- Git: <https://git-scm.com/>
- Node: <https://nodejs.org/en>
- IDE: <https://code.visualstudio.com/>

Resources:

- [NPM Packages using CReATE](https://devops.c2.army.mil/cArmy/GettingStarted/_wiki/wikis/GettingStarted.wiki/106/NPM-Packages-using-CREATE-Nexus-Proxy)

## Node Set up

### Nexus NPM registry configuration

    1. Open bash terminal in or navigate to the project's root directory and run commands below:

       ```
       # Sets Certificate Authority File for NPM
       npm config set cafile create_nexus_generated.pem

       # Point to Nexus NPM registry in
       npm config set registry 'https://nexus.create.army.mil/repository/npm-proxy/'

       # View NPM config
       npm config list

       # Install node packages
       npm i --legacy-peer-deps --save-dev

       # Run app
       npm run dev
       ```

### GitLab package registry configuration

1. Create Git Lab personal authentication token with api scoping '<https://code.dse.futures.army.mil/-/user_settings/personal_access_tokens>'
2. Create .npmrc file in root of front-end application and add these two lines.
3. Replace <GITLAB_AUTH_TOKEN> with personal authentication token.

   ```
       @ai2c:registry=https://code.dse.futures.army.mil/api/v4/projects/1435/packages/npm/
       \/\/code.dse.futures.army.mil/api/v4/projects/1435/packages/npm/:\_authToken=<GITLAB_AUTH_TOKEN>
   ```

4. Run install command

   ```
   npm install @ai2c/pmx-mui
   ```

## VS Code Extentions

```
"dbaeumer.vscode-eslint", // ESLint
"streetsidesoftware.code-spell-checker", // Code Spell Checker
"esbenp.prettier-vscode", // Prettier - Code Formatter
"mronline.react-import-sorter", //  React Import Sorter
"dotjoshjohnson.xml", // XML Tools
"rangav.vscode-thunder-client", // Thunder Client
"github.copilot", // Copilot
"sonarsource.sonarlint-vscode", // SonarLint
"vitest.explorer", // Vitest Explorer
"kamikillerto.vscode-colorize" // CSS hex & rgb Colorizer
```
