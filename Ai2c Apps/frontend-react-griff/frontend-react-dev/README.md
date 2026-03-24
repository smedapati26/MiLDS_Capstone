# PMx Griffin.AI

PMx Griffin.AI is a predictive analytics platform for Army Aircraft

Prerequisites:

- Git: <https://git-scm.com/>
- Node: <https://nodejs.org/en>
- IDE: <https://code.visualstudio.com/>

Resources:

- [NPM Packages using CReATE](https://devops.c2.army.mil/cArmy/GettingStarted/_wiki/wikis/GettingStarted.wiki/106/NPM-Packages-using-CREATE-Nexus-Proxy)

## Node Set up

### GitLab package registry configuration for AI2C MUI Components Library

1. Create Git Lab personal authentication token with api scoping '<https://code.cdso.army.mil/-/user_settings/personal_access_tokens>'
2. Create .npmrc file in root of front-end application and add these two lines.
3. Replace <GITLAB_AUTH_TOKEN> with personal authentication token.

```
   @ai2c:registry=https://code.cdso.army.mil/api/v4/projects/3083/packages/npm/
   //code.cdso.army.mil/api/v4/projects/3083/packages/npm/:_authToken=cdso-<GITLAB_AUTH_TOKEN>
```

### Install Node Packages

```
   # Install node packages
   npm i --legacy-peer-deps --save-dev

   # Troublesome install
   rm -rf node_modules package-lock.json && npm install --legacy-peer-deps --save-dev
```

### Run Application

Open bash terminal in or navigate to the project's root directory and run commands below:

```
   # Run app
   npm run dev
```

### Run Testing

Open bash terminal in or navigate to the project's root directory and run commands below:

```
   # Run tests
   npm run test

   # Run individual unit test
   npm run test -- <name of file>.test.ts --watch
```

## VS Code Extensions

```
   "dbaeumer.vscode-eslint", // ESLint
   "dotjoshjohnson.xml", // XML Tools
   "esbenp.prettier-vscode", // Prettier - Code Formatter
   "github.copilot", // Copilot
   "kamikillerto.vscode-colorize", // CSS hex & rgb Colorizer
   "kingwl.vscode-vitest-runner", // Vitest Runner
   "mronline.react-import-sorter", //  React Import Sorter
   "rangav.vscode-thunder-client", // Thunder Client
   "streetsidesoftware.code-spell-checker", // Code Spell Checker
   "vitest.explorer", // Vitest Explorer
```

## Local Environment Execution

Create the .env.development.local file at the root of the project with the following contents:

```
    NODE_ENV=development
    VITE_APP_TITLE="Griffin.AI"
    VITE_GRIFFIN_API_URL="http://127.0.0.1:8000/api"
    VITE_AMAP_API_URL="http://127.0.0.1:8080/api"
    VITE_FF_INDEX_ROUTE="maintenance-schedule"
    VITE_FF_ACCOUNT_MANAGEMENT=1
    VITE_FF_COMPONENT_MANAGEMENT=1
    VITE_FF_MAINTENANCE_SCHEDULE=1
    VITE_FF_MAINTENANCE_SCHEDULE_CALENDAR=1
    VITE_FF_MAINTENANCE_SCHEDULE_PHASE_FLOW=1
    VITE_FF_READINESS_ANALYTICS=1
    VITE_FF_READINESS_ANALYTICS_OVERVIEW=1
    VITE_FF_READINESS_ANALYTICS_TRAINING=1
    VITE_FF_READINESS_ANALYTICS_EQUIPMENT=1
    VITE_FF_READINESS_ANALYTICS_MAINTENANCE_TIME=1
    VITE_FF_READINESS_ANALYTICS_PERSONNEL=1
    VITE_FF_TASK_FORCES=1
```

This file will be used when running locally but not when deployed.
