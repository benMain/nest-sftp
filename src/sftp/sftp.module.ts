import { DynamicModule, Global, Module } from '@nestjs/common';

import { ConnectConfig } from 'ssh2';
import { SftpClientService } from './sftp-client/sftp-client.service';

import SftpClient = require('ssh2-sftp-client');

@Global()
@Module({
  providers: [SftpClientService],
  exports: [SftpClientService],
})
export class SftpModule {
  static forRoot(
    config: ConnectConfig,
    delayConnection: boolean = false,
  ): DynamicModule {
    return {
      module: SftpModule,
      providers: [
        SftpClientService,
        {
          provide: SftpClient,
          useFactory: async () => {
            const client = new SftpClient();
            if (!delayConnection) {
              await client.connect(config);
            }
            return client;
          },
        },
      ],
      exports: [SftpClientService],
    };
  }
}
