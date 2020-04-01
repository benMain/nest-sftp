import { Injectable, Logger } from '@nestjs/common';
import { ReadStreamOptions, WriteStreamOptions } from 'ssh2-streams';

import { ConnectConfig } from 'ssh2';

import SftpClient = require('ssh2-sftp-client');

@Injectable()
export class SftpClientService {
  private readonly logger: Logger;
  constructor(private readonly sftpClient: SftpClient) {
    this.logger = new Logger(SftpClientService.name);
  }

  async upload(
    contents: string | Buffer | NodeJS.ReadableStream,
    remoteFilePath: string,
    options: WriteStreamOptions = null,
  ): Promise<void> {
    await this.sftpClient.put(contents, remoteFilePath, options);
  }

  async list(remoteDirectory: string): Promise<SftpClient.FileInfo[]> {
    return await this.sftpClient.list(remoteDirectory);
  }

  async download(
    path: string,
    dst?: string | NodeJS.ReadableStream,
    options?: ReadStreamOptions,
  ): Promise<string | NodeJS.ReadableStream | Buffer> {
    // @ts-ignore
    return await this.sftpClient.get(path, dst, options);
  }

  async delete(remoteFilePath: string): Promise<void> {
    await this.sftpClient.delete(remoteFilePath);
  }

  async makeDirectory(
    remoteFilePath: string,
    recursive: boolean = true,
  ): Promise<void> {
    await this.sftpClient.mkdir(remoteFilePath, recursive);
  }

  async removeDirectory(
    remoteFilePath: string,
    recursive: boolean = true,
  ): Promise<void> {
    await this.sftpClient.rmdir(remoteFilePath, recursive);
  }

  async rename(
    remoteSourcePath: string,
    remoteDestinationPath: string,
  ): Promise<void> {
    await this.sftpClient.rename(remoteSourcePath, remoteDestinationPath);
  }

  /**
   * Tests to see if remote file or directory exists.
   * Returns type of remote object if it exists or false if it does not.
   *
   * @param remotePath
   * @returns false or d, -, l (dir, file or link)
   */
  async exists(remotePath: string): Promise<false | 'd' | '-' | 'l'> {
    return await this.sftpClient.exists(remotePath);
  }

  async connect(config: ConnectConfig) {
    await this.sftpClient.connect(config);
  }
}
