import {
  AsyncProvider,
  ConnectConfigExt,
  ImportableFactoryProvider,
} from './async-types';
import { DynamicModule, Global, Module } from '@nestjs/common';

import { SftpClientService } from './sftp-client/sftp-client.service';

import * as SftpClient from 'ssh2-sftp-client';

@Global()
@Module({
  providers: [SftpClientService],
  exports: [SftpClientService],
})
export class SftpModule {
  static forRoot(
    config: ConnectConfigExt,
    delayConnection = false,
  ): DynamicModule {
    return {
      module: SftpModule,
      providers: [
        SftpClientService,
        {
          provide: SftpClient,
          useFactory: async () => {
            const delay = config?.delayConnection ?? delayConnection;
            const client = new SftpClient();
            if (!delay) {
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
    config: AsyncProvider<ConnectConfigExt | Promise<ConnectConfigExt>>,
    delayConnection = false,
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
          useFactory: async (connectConfig: ConnectConfigExt) => {
            const delay = connectConfig?.delayConnection ?? delayConnection;
            const client = new SftpClient();
            if (!delay) {
              await client.connect(connectConfig);
            }
            return client;
          },
          inject: [configToken],
        },
      ],
      exports: [SftpClientService],
    };

    this.addAsyncProvider<ConnectConfigExt>(module, configToken, config, false);
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
