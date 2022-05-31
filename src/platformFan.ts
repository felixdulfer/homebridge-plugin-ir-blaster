import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';
import { IrBlaster } from './IrBlaster';

export interface IFanAccessoryCommands {
  off: string;
  speed1: string;
  speed2: string;
  speed3: string;
}

export interface FanAccessoryConfig
  extends Pick<PlatformAccessory, 'displayName'> {
  uniqueId: string;
  blaster: { uniqueId: string };
  type: 'Fan';
  commands: IFanAccessoryCommands;
}

export interface IFanAccessoryContext {
  commands: IFanAccessoryCommands;
  irBlaster: IrBlaster;
}

export class FanAccessory {
  private service: Service;

  private states = {
    On: false,
    RotationSpeed: 0,
  };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory<IFanAccessoryContext>
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
      this.accessory.getService(this.platform.Service.Fan) ||
      this.accessory.addService(this.platform.Service.Fan);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.displayName
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .onSet(this.setRotationSpeed.bind(this))
      .onGet(this.getRotationSpeed.bind(this));
  }

  async setOn(value: CharacteristicValue) {
    this.states.On = value as boolean;

    if (this.states.On) {
      this.accessory.context.irBlaster.transmit(
        this.accessory.context.commands.speed3
      );
    } else {
      this.accessory.context.irBlaster.transmit(
        this.accessory.context.commands.off
      );
    }

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.states.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    return isOn;
  }

  async setRotationSpeed(value: CharacteristicValue) {
    this.platform.log.debug('Set Characteristic RotationSpeed ->', value);

    const speeds = 3;
    const speedScale = 100 / speeds;

    if (value > 0 && value < speedScale * 1) {
      this.accessory.context.irBlaster.transmit(
        this.accessory.context.commands.speed1
      );
      this.platform.log.debug('Set speed 1');
    } else if (value > speedScale * 1 && value < speedScale * 2) {
      this.accessory.context.irBlaster.transmit(
        this.accessory.context.commands.speed2
      );
      this.platform.log.debug('Set speed 2');
    } else if (value > speedScale * 2 && value < speedScale * 3) {
      this.accessory.context.irBlaster.transmit(
        this.accessory.context.commands.speed3
      );
      this.platform.log.debug('Set speed 3');
    }

    this.states.RotationSpeed = value as number;
  }

  async getRotationSpeed(): Promise<CharacteristicValue> {
    const rotationSpeed = this.states.RotationSpeed;

    this.platform.log.debug(
      'Get Characteristic RotationSpeed ->',
      rotationSpeed
    );

    return rotationSpeed;
  }
}
