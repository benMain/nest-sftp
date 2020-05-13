import { Injectable, Logger } from '@nestjs/common';
import { ReadStreamOptions, WriteStreamOptions, TransferOptions } from 'ssh2-streams';

import { ConnectConfig } from 'ssh2';

import SftpClient = require('ssh2-sftp-client');

@Injectable()
export class SftpClientService {
  private readonly logger: Logger;
  constructor(private readonly sftpClient: SftpClient) {
    this.logger = new Logger(SftpClientService.name);
  }

  async client() {
    return this.sftpClient;
  }

  /**
   * Resets the sftp connection, updates/creates the connection used in initialization.
   *
   * @param config
   */
  async resetConnection(config: ConnectConfig): Promise<void> {
    try {
      await this.sftpClient.end();
      await this.sftpClient.connect(config);
    } catch (ex) {
      if (ex.code === 'ERR_NOT_CONNECTED') {
        await this.sftpClient.connect(config);
      } else {
        throw ex;
      }
    }
  }

  /**
   * Closes the current connection.
   */
  async disconnect() {
    await this.sftpClient.end();
  }

  /**
   * Returns remote file information.
   *
   * @param remotePath the remote file location
   */
  async stat(remotePath: string): Promise<SftpClient.FileStats> {
    return await this.sftpClient.stat(remotePath);
  }

  async upload(
    contents: string | Buffer | NodeJS.ReadableStream,
    remoteFilePath: string,
    options: WriteStreamOptions = null,
  ): Promise<string> {
    return await this.sftpClient.put(contents, remoteFilePath, options);
  }

  async list(remoteDirectory: string): Promise<SftpClient.FileInfo[]> {
    return await this.sftpClient.list(remoteDirectory);
  }

  async download(
    path: string,
    dst?: string | NodeJS.WritableStream,
    options?: TransferOptions,
): Promise<string | NodeJS.WritableStream | Buffer> {
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
