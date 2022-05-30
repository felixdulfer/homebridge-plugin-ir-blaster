import { Logger } from 'homebridge';
import { inspect } from 'util';
import { BlasterConfig } from '../platform';
import { IrBlasterHttpTransport } from './IrBlasterHttpTransport';

export class IrBlaster {
  private httpTransport: IrBlasterHttpTransport;

  constructor(
    private readonly log: Logger,
    public readonly config: BlasterConfig
  ) {
    this.log.debug(
      'Blaster has been configured',
      inspect({ config }, { colors: true })
    );

    this.httpTransport = new IrBlasterHttpTransport(this.log);
  }

  async transmit(command: string) {
    return this.httpTransport.post(this.config.address, '/ir', command);
  }
}
