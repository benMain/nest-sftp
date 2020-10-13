import { AsyncProvider, ImportableFactoryProvider } from './async-types';
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

  static forRootAsync(
    config: AsyncProvider<ConnectConfig | Promise<ConnectConfig>>,
    delayConnection: boolean = false,
  ): DynamicModule {
    const configToken = 'CONNECT_CONFIG';
    const module: DynamicModule = {
      global: true,
      module: SftpModule,
      imports: [],
      providers: [
        SftpClientService,
        {
          provide: SftpClient,
          useFactory: async (connectConfig: ConnectConfig) => {
            const client = new SftpClient();
            if (!delayConnection) {
              await client.connect(connectConfig);
            }
            return client;
          },
          inject: [configToken],
        },
      ],
      exports: [SftpClientService],
    };

    this.addAsyncProvider<ConnectConfig>(module, configToken, config, false);
    return module;
  }

  private static addAsyncProvider<T>(
    module: DynamicModule,
    provide: string,
    asyncProvider: AsyncProvider<T | Promise<T>>,
    exportable: boolean,
  ) {
    const imports = (asyncProvider as ImportableFactoryProvider<T>).imports;
    if (imports?.length) {
      imports.forEach((i) => module.imports.push(i));
    }
    delete (asyncProvider as ImportableFactoryProvider<T>).imports;

    module.providers.push({
      ...asyncProvider,
      provide,
    });

    if (exportable) {
      module.exports.push(provide);
    }
  }
}
