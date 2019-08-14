import { Module, Global, DynamicModule } from '@nestjs/common';
import { SftpClientService } from './sftp-client/sftp-client.service';
import SftpClient = require('ssh2-sftp-client');
import { ConnectConfig } from 'ssh2';

@Global()
@Module({
  providers: [SftpClientService],
  exports: [SftpClientService],
})
export class SftpModule {
  static forRoot(config: ConnectConfig): DynamicModule {
    return {
      module: SftpModule,
      providers: [
        SftpClientService,
        {
          provide: SftpClient,
          useFactory: async () => {
            const client = new SftpClient();
            await client.connect(config);
            return client;
          },
        },
      ],
      exports: [SftpClientService],
    };
  }
}
