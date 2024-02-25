<div align="center">

<h1>IpcMan</h1>
<p>Electron IPC Hook/Devtools</p>

[![License](https://img.shields.io/github/license/ilharp/ipcman?style=flat-square)](https://github.com/ilharp/ipcman/blob/master/LICENSE)
</div>

<https://github.com/ilharp/ipcman/assets/20179549/71d4f999-cf24-4936-8eab-7e77b465cc44>

## Contents

Package|Contents
-|-
ipcman|~3KB core module, providing Electron IPC hook with request/response tagging
@ipcman/devtools|Devtools backend, providing an HTTP/WebSocket API
@ipcman/devtools-fe|Devtools frontend, providing real-time IPC monitoring, history playback, request/response binding and inspector

## IpcMan Devtools Guide

### Step 1: Download IpcMan Devtools

First, download IpcMan Devtools from [Releases](https://github.com/ilharp/ipcman/releases) and extract.

### Step 2: Inject

Next, inject IpcMan Devtools into the target electron app. There are several ways to do this,
the simplest of which is to directly modify the entry JavaScript file. We'll take [Waves Central](https://www.waves.com/downloads/central) as an example.

Open `resources` folder under app directory. If there's no `app` folder in it but only `app.asar` file, run following command to extract `app` folder:

```sh
npx asar extract app.asar app
mv app.asar app.asar.bak
```

Next, open `package.json` inside `app`, you'll see the entrypoint of the app:

```js
{
  // ...
  "main": "src/main.js",
  // ...
}
```

Open `src/main.js` and insert the line below at the top of the file:

```js
require('/path/to/downloaded/ipcman.js').ipcManDevtools({})
```

### Step 3: Run App

Finally, directly run the app. Once the app starts, head to <http://127.0.0.1/9009> and you'll see the Devtools frontend. Happy hacking!

## `ipcman` Reference

### Function `ipcMan: <IpcArgs extends unknown[] = unknown[]>(config: IpcManConfig<IpcArgs>) => IpcManContext`

The `ipcMan()` function.

### Interface `IpcManConfig`

Options for `ipcMan()`.

#### Function `handler: (data: IpcManData) => unknown`

The event handler. Required.

#### Function `getId?: (p: IpcArgs) => string | undefined`

ID detect logic for resoving wrapped request/response of target app. Optional.

## `@ipcman/devtools` Reference

### Function `ipcManDevtools: (config: IpcManDevtoolsConfig) => Promise<void>`

Start IpcMan Devtools.

### Interface `IpcManDevtoolsConfig extends Omit<IpcManConfig, 'handler'>`

Options for `ipcManDevtools()`. Same as `IpcManConfig` but without `handler`.

## LICENSE

MIT
