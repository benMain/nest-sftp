<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://blogs.mulesoft.com/wp-content/uploads/2017/11/sftp-ftp-mulesoft-connector-anypoint.png" /></a>
</p>

# NEST SFTP

## Description

[Nest](https://github.com/nestjs/nest) framework module wrapper around [ssh2-sftp-client](https://github.com/jyu213/ssh2-sftp-client)

## Installation

```bash
$ npm install --save nest-sftp
```

## Register in AppModule

```typescript
import { SftpModule } from 'nest-sftp';

@Module({
  imports: [SftpModule.forRoot({ host: 'fakehost.com', port: 20000 })],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## Dependency Inject Service

The SftpModule is global. The forRoot() method will open the connection as well during AppModule registration.
Then the SftpClientService can be injected into your class.

```typescript
import { SftpClientService } from 'nest-sftp';

export class AppService {
  private readonly logger: Logger;
  constructor(private readonly sftpClient: SftpClientService) {
    logger = new Logger();
  }

  async download(
    remotePath: string,
    localPath: string,
  ): Promise<string | NodeJS.ReadableStream | Buffer> {
    return await this.sftpClient.download(remotePath, localPath);
  }
}
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Benjamin Main](mailto::bmain@lumeris.com)

## License

Nest SFTP is [MIT licensed](LICENSE).
