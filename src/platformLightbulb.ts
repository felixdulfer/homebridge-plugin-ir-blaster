import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';
import { IrBlaster } from './IrBlaster';

interface ILightbulbAccessoryCommands {
  on: string;
  off: string;
}

export interface LightbulbAccessoryConfig
  extends Pick<PlatformAccessory, 'displayName'> {
  uniqueId: string;
  displayName: string;
  blaster: { uniqueId: string };
  type: 'Lightbulb';
  commands: ILightbulbAccessoryCommands;
}

export interface ILightbulbAccessoryContext {
  commands: ILightbulbAccessoryCommands;
  irBlaster: IrBlaster;
}

export class LightbulbAccessory {
  private service: Service;

  private states = {
    On: false,
  };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory<ILightbulbAccessoryContext>
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'Default-Manufacturer'
      )
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        'Default-Serial'
      );

    this.service =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.displayName
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));
  }

  async setOn(value: CharacteristicValue) {
    this.states.On = value as boolean;

    if (this.states.On) {
      await this.accessory.context.irBlaster.transmit(
        this.accessory.context.commands.on
      );
    } else {
      await this.accessory.context.irBlaster.transmit(
        this.accessory.context.commands.off
      );
    }

    this.platform.log.debug(
      `Set ${this.accessory.displayName} Characteristic On ->`,
      value
    );
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.states.On;

    this.platform.log.debug(
      `Get ${this.accessory.displayName} Characteristic On ->`,
      isOn
    );

    return isOn;
  }
}
