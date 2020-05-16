import { Injectable, Logger } from '@nestjs/common';
import {
  ReadStreamOptions,
  TransferOptions,
  WriteStreamOptions,
} from 'ssh2-streams';

import { ConnectConfig } from 'ssh2';

import SftpClient = require('ssh2-sftp-client');

@Injectable()
export class SftpClientService {
  private readonly logger: Logger;
  constructor(private readonly sftpClient: SftpClient) {
    this.logger = new Logger(SftpClientService.name);
  }

  client() {
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
   * Returns the attributes associated with the object pointed to by remotePath
   *
   * @param remotePath the remote file location
   *
   * @returns
   * ```
   * let stats = {
   *   mode: 33279, // integer representing type and permissions
   *   uid: 1000, // user ID
   *   gid: 985, // group ID
   *   size: 5, // file size
   *   accessTime: 1566868566000, // Last access time. milliseconds
   *   modifyTime: 1566868566000, // last modify time. milliseconds
   *   isDirectory: false, // true if object is a directory
   *   isFile: true, // true if object is a file
   *   isBlockDevice: false, // true if object is a block device
   *   isCharacterDevice: false, // true if object is a character device
   *   isSymbolicLink: false, // true if object is a symbolic link
   *   isFIFO: false, // true if object is a FIFO
   *   isSocket: false // true if object is a socket
   * };
   * ```
   */
  async stat(remotePath: string): Promise<SftpClient.FileStats> {
    return await this.sftpClient.stat(remotePath);
  }

  /**
   * Converts a relative path to an absolute path on the remote server.
   * This method is mainly used internally to resolve remote path names.
   * Returns '' if the path is not valid.
   *
   * @param remotePath A file path, either relative or absolute. Can handle '.' and '..', but does not expand '~'.
   */
  async realPath(remotePath: string): Promise<string> {
    return await this.sftpClient.realPath(remotePath);
  }

  async upload(
    contents: string | Buffer | NodeJS.ReadableStream,
    remoteFilePath: string,
    options: WriteStreamOptions = null,
  ): Promise<string> {
    return await this.sftpClient.put(contents, remoteFilePath, options);
  }

  /**
   * Retrieves a directory listing. This method returns a Promise, which once realised, returns an array of objects representing items in the remote directory.
   *
   * @param remoteDirectory {String} Remote directory path
   * @param pattern (optional) {string|RegExp} A pattern used to filter the items included in the returned array. Pattern can be a simple glob-style string or a regular expression. Defaults to /.* &#8205;/
   *
   */
  async list(
    remoteDirectory: string,
    pattern?: string | RegExp,
  ): Promise<SftpClient.FileInfo[]> {
    return await this.sftpClient.list(remoteDirectory);
  }

  /**
   * Retrieve a file from a remote SFTP server.
   * The dst argument defines the destination and can be either a string,
   * a stream object or undefined. If it is a string, it is interpreted as the
   * path to a location on the local file system (path should include the file name).
   * If it is a stream object, the remote data is passed to it via a call to pipe().
   * If dst is undefined, the method will put the data into a buffer and return that buffer when the Promise is resolved.
   * If dst is defined, it is returned when the Promise is resolved.
   *
   * @param path String. Path to the remote file to download
   * @param dst String|Stream. Destination for the data. If a string, it should be a local file path.
   * @param options ```
   * {
   *   flags: 'r',
   *   encoding: null,
   *   handle: null,
   *   mode: 0o666,
   *   autoClose: true
   * }
   * ```
   */
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
