import http from 'http';
import { performance, PerformanceObserver } from 'perf_hooks';
import { inspect } from 'util';
import { nanoid } from 'nanoid';
import humanizeDuration from 'humanize-duration';
import { Logger } from 'homebridge';

export class IrBlasterHttpTransport {
  performanceObserver: PerformanceObserver;

  constructor(private readonly log: Logger) {
    this.performanceObserver = new PerformanceObserver((items) => {
      items.getEntries().forEach((entry) => {
        const humanizedDuration = humanizeDuration(entry.duration, {
          maxDecimalPoints: 2,
        });
        this.log.debug(`${entry.name} took ${humanizedDuration}`);
      });
    });

    this.performanceObserver.observe({ entryTypes: ['measure'] });
  }

  async post(address: string, path: string, command: string) {
    return this.request(address, 'POST', path, command);
  }

  async request(host: string, method: string, path: string, body?: string) {
    const requestId = nanoid();

    performance.mark(`${requestId}-start`);

    this.log.debug(
      `${IrBlasterHttpTransport.name}#request`,
      inspect(
        { host, path, body: body ? `${body.substring(0, 10)}…` : body },
        { colors: true }
      )
    );

    try {
      const result = await new Promise((resolve, reject) => {
        const req = http.request(
          {
            host: host,
            port: 80,
            path: path,
            method: method,
            headers: body
              ? {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(body),
              }
              : undefined,
          },
          (res) => {
            let buf = '';
            res.on('data', (chunk) => {
              buf += chunk;
            });
            res.on('end', () => {
              resolve(buf);
            });
          }
        );

        req.on('error', reject);
        if (body) {
          req.write(body);
        }
        req.end();
      });
      this.log.debug(`request ${requestId} result => ${result}`);
      performance.mark(`${requestId}-end`);
    } catch (e) {
      this.log.error('Error while making request to IR Blaster', e);
    } finally {
      performance.measure(
        `request ${requestId}`,
        `${requestId}-start`,
        `${requestId}-end`
      );
    }
  }
}
