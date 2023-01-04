import { Injectable, Module } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { SftpClientService } from './sftp-client';
import { SftpModule } from './sftp.module';

@Injectable()
export class ConfigService {
  get(key: string): string {
    return process.env[key];
  }
}

// tslint:disable-next-line: max-classes-per-file
@Module({
  imports: [
    SftpModule.forRootAsync(
      {
        useFactory: (configService: ConfigService) => {
          return {
            host: configService.get('SFTP_HOST'),
            port: configService.get('SFTP_PORT') as unknown as number,
            username: configService.get('SFTP_USERNAME'),
            password: configService.get('SFTP_PASSWORD'),
          };
        },
        inject: [ConfigService],
        imports: [TestRootModuleAsync],
      },
      true,
    ),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
class TestRootModuleAsync {}

describe('SftpModule', () => {
  describe('forRootAsync()', () => {
    it('should instantiate?', async () => {
      jest.setTimeout(30000);
      process.env.SFTP_HOST = 'test.rebex.net';
      process.env.SFTP_PORT = '22';
      process.env.SFTP_USERNAME = 'demo';
      process.env.SFTP_PASSWORD = 'password';
      const module = await NestFactory.createApplicationContext(
        TestRootModuleAsync,
      );
      const service = module.get<SftpClientService>(SftpClientService);
      expect(service).toBeDefined();
      await module.close();
    });
  });
});
