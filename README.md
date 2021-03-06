<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

# Homebridge Platform Plugin IR Blaster

Sends signals to a modified Tyua IR Blaster, running a [custom firmware](https://gitco.re/HomeAutomation/ir-blaster).

Currently supports a Lightbulb and a Fan with 3 speeds. The goal for this project is to support a wider range of Homebridge/Homekit supported devices, as well as some kind of mapping to generic stateful/stateless buttons. For example; a generic button to turn on/off a receiver (which Homekit has no support for).

This repo is based on [Homebridge Plugin Template](https://github.com/homebridge/homebridge-plugin-template/generate).

## Config Example

```json
{
  "platform": "IRBlasterHomebridgePlugin",
  "name": "IRBlasterHomebridgePlugin",
  "blasters": [
    {
      "displayName": "Master Bedroom",
      "uniqueId": "master-bedroom-blaster-prod",
      "address": "192.168.226.121"
    }
  ],
  "accessoires": [
    {
      "displayName": "Master Bedroom Fan Light",
      "uniqueId": "master-bedroom-fan-light",
      "type": "Lightbulb",
      "blaster": {
        "uniqueId": "master-bedroom-blaster-prod"
      },
      "commands": {
        "on": "1214, 414, 1204, ...",
        "off": "1214, 420, 1194, ..."
      }
    },
    {
      "displayName": "Master Bedroom Fan Speed",
      "uniqueId": "master-bedroom-fan-speed",
      "type": "Fan",
      "blaster": {
        "uniqueId": "master-bedroom-blaster-prod"
      },
      "commands": {
        "off": "1240, 428, 1182, ...",
        "speed1": "1250, 446, 1158, ...",
        "speed2": "1244, 462, 1150, ...",
        "speed3": "1248, 386, 1192, ..."
      }
    }
  ]
}
```

## Setup Development Environment

To develop Homebridge plugins you must have Node.js 12 or later installed, and a modern code editor such as [VS Code](https://code.visualstudio.com/). This plugin template uses [TypeScript](https://www.typescriptlang.org/) to make development easier and comes with pre-configured settings for [VS Code](https://code.visualstudio.com/) and ESLint. If you are using VS Code install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Install Development Dependencies

Using a terminal, navigate to the project folder and run this command to install the development dependencies:

```console
npm install
```

## Build Plugin

TypeScript needs to be compiled into JavaScript before it can run. The following command will compile the contents of your [`src`](./src) directory and put the resulting code into the `dist` folder.

```console
npm run build
```

## Link To Homebridge

Run this command so your global install of Homebridge can discover the plugin in your development environment:

```console
npm link
```

You can now start Homebridge, use the `-D` flag so you can see debug log messages in your plugin:

```console
homebridge -D
```

## Watch For Changes and Build Automatically

If you want to have your code compile automatically as you make changes, and restart Homebridge automatically between changes you can run:

```console
npm run watch
```

This will launch an instance of Homebridge in debug mode which will restart every time you make a change to the source code. It will load the config stored in the default location under `~/.homebridge`. You may need to stop other running instances of Homebridge while using this command to prevent conflicts. You can adjust the Homebridge startup command in the [`nodemon.json`](./nodemon.json) file.

## Customise Plugin

You can now start customising the plugin template to suit your requirements.

- [`src/platform.ts`](./src/platform.ts) - Device setup and discovery.
- [`src/platformLightbulb.ts`](./src/platformLightbulb.ts) - Lightbulb Accessory logic.
- [`src/platformFan.ts`](./src/platformFan.ts) - Fan Accessory logic.
- [`config.schema.json`](./config.schema.json) - Configuration schema for Homebridge UI. See the [Plugin Config Schema Documentation](https://developers.homebridge.io/#/config-schema).

More documentation on Homebridge API: https://developers.homebridge.io.

## Publish Plugin

The easiest way to publish is through [`np`](https://github.com/sindresorhus/np#readme):

```console
npx -y np
```

### Publishing Beta Versions

You can publish _beta_ versions of your plugin for other users to test before you release it to everyone.

```console
npx -y np --tag=beta
```

Users can then install the _beta_ version by appending `@beta` to the install command, for example:

```console
sudo npm install -g homebridge-plugin-ir-blaster@beta
```

## To-Do

- [ ] Fix config schema.
- [ ] Add tests.
- [ ] Replace `ping` dependency for a HEAD request.
- [ ] Add a UI for interactively setting IR codes (seems to be outside of the scope of the config schema).
