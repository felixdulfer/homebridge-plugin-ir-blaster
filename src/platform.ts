import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
  UnknownContext,
} from 'homebridge';

import ping from 'ping';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ExamplePlatformAccessory } from './platformAccessory';
import {
  LightbulbAccessoryConfig,
  LightbulbAccessory,
  ILightbulbAccessoryContext,
} from './platformLightbulb';
import { IrBlaster } from './IrBlaster';
import { inspect } from 'util';
import {
  FanAccessory,
  FanAccessoryConfig,
  IFanAccessoryContext,
} from './platformFan';

export type BlasterConfig = {
  uniqueId: string;
  displayName: string;
  address: string;
};

interface IRBlasterPlatformConfig extends PlatformConfig {
  blasters?: BlasterConfig[];
  accessoires?: (LightbulbAccessoryConfig | FanAccessoryConfig)[];
}

/**
 * @todo platform should be using StaticPlatformPlugin?
 */
export class ExampleHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  public readonly blasters: IrBlaster[] = [];
  public readonly accessories: PlatformAccessory<{
    irBlaster: IrBlaster;
    commands: any;
  }>[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: IRBlasterPlatformConfig,
    public readonly api: API
  ) {
    this.log.debug('Finished initializing platform:', this.config);

    this.blasters = (this.config.blasters ?? []).map(
      (blasterConfig) => new IrBlaster(log, blasterConfig)
    );

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory<any>) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverIrBlasters() {
    for (const blaster of this.blasters) {
      this.log.debug('Discovering IR Blaster:', blaster.config.displayName);

      const pingResponse = await ping.promise.probe(blaster.config.address, {
        timeout: 60,
      });

      if (!pingResponse.alive) {
        throw new Error(
          `IR Blaster at ${blaster.config.address} is not responding.`
        );
      }

      this.log.debug(
        `Blaster at ${blaster.config.address} is alive (ping: ${pingResponse.avg}ms).`
      );
    }
  }

  async discoverDevices() {
    await this.discoverIrBlasters();

    for (const accessory of this.config.accessoires ?? []) {
      this.log.debug(
        'Accessory',
        inspect(accessory, { depth: 0, colors: true })
      );

      const uuid = this.api.hap.uuid.generate(accessory.uniqueId);
      const irBlaster = this.getBlasterByUniqueId(accessory.blaster.uniqueId);

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid
      );

      this.log.debug(
        `Existing Accessory "${accessory.displayName}":`,
        existingAccessory ? 'found' : 'not found'
      );

      if (existingAccessory) {
        this.log.info(
          'Restoring existing accessory from cache:',
          existingAccessory.displayName
        );

        existingAccessory.context.irBlaster = irBlaster;
        existingAccessory.context.commands = accessory.commands;

        this.api.updatePlatformAccessories([existingAccessory]);

        switch (accessory.type) {
          case 'Lightbulb': {
            new LightbulbAccessory(this, existingAccessory);
            break;
          }
          case 'Fan': {
            new FanAccessory(this, existingAccessory);
            break;
          }
        }
      } else {
        this.log.info(
          `Adding new ${accessory.type} accessory:`,
          accessory.displayName
        );

        const newAaccessory = new this.api.platformAccessory<UnknownContext>(
          accessory.displayName,
          uuid
        );

        newAaccessory.context.irBlaster = irBlaster;
        newAaccessory.context.commands = accessory.commands;

        switch (accessory.type) {
          case 'Lightbulb': {
            new LightbulbAccessory(
              this,
              newAaccessory as PlatformAccessory<ILightbulbAccessoryContext>
            );
            break;
          }
          case 'Fan': {
            new FanAccessory(
              this,
              newAaccessory as PlatformAccessory<IFanAccessoryContext>
            );
            break;
          }
        }

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          newAaccessory,
        ]);
      }
    }
  }

  getBlasterByUniqueId(_uniqueId: string) {
    const found = this.blasters.find(
      ({ config: { uniqueId } }) => uniqueId === _uniqueId
    );

    if (!found) {
      throw new Error(`Could not find blaster with uniqueId "${_uniqueId}"`);
    } else {
      return found;
    }
  }
}
