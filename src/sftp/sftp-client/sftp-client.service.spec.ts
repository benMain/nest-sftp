import { ConnectConfig, SFTPWrapper } from 'ssh2';
import { Test, TestingModule } from '@nestjs/testing';

import { SftpClientService } from './sftp-client.service';

import SftpClient = require('ssh2-sftp-client');

type FileInfoType = 'd' | '-' | 'l';

describe('SftpClientService', () => {
  let service: SftpClientService;
  let sftpClient: SftpClient;
  let putSftpSpy: jest.SpyInstance<
    Promise<string>,
    [
      string | Buffer | NodeJS.ReadableStream,
      string,
      SftpClient.TransferOptions?,
    ]
  >;
  let listSftpSpy: jest.SpyInstance<
    Promise<SftpClient.FileInfo[]>,
    [string, SftpClient.ListFilterFunction?]
  >;
  let getSftpSpy: jest.SpyInstance<
    Promise<string | NodeJS.WritableStream | Buffer>,
    [string, (string | NodeJS.WritableStream)?, SftpClient.TransferOptions?]
  >;
  let deleteSftpSpy: jest.SpyInstance<Promise<string>, [string, boolean?]>;
  let makedirectorySftpSpy: jest.SpyInstance<
    Promise<string>,
    [string, boolean?]
  >;
  let removeDirectorySftpSpy: jest.SpyInstance<
    Promise<string>,
    [string, boolean?]
  >;
  let renameSftpSpy: jest.SpyInstance<Promise<string>, [string, string]>;
  let existsSftpSpy: jest.SpyInstance<Promise<false | FileInfoType>, [string]>;
  let connectSftpSpy: jest.SpyInstance<Promise<SFTPWrapper>, [ConnectConfig]>;
  let statSpy: jest.SpyInstance;
  let endSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SftpClientService,
        {
          provide: SftpClient,
          useValue: {
            put: () => null,
            list: () => null,
            get: () => null,
            delete: () => null,
            mkdir: () => null,
            rmdir: () => null,
            rename: () => null,
            exists: () => null,
            connect: () => null,
            stat: () => null,
            end: () => null,
          },
        },
      ],
    }).compile();

    service = module.get<SftpClientService>(SftpClientService);
    sftpClient = module.get<SftpClient>(SftpClient);
    putSftpSpy = jest.spyOn(sftpClient, 'put');
    listSftpSpy = jest.spyOn(sftpClient, 'list');
    getSftpSpy = jest.spyOn(sftpClient, 'get');
    deleteSftpSpy = jest.spyOn(sftpClient, 'delete');
    makedirectorySftpSpy = jest.spyOn(sftpClient, 'mkdir');
    removeDirectorySftpSpy = jest.spyOn(sftpClient, 'rmdir');
    renameSftpSpy = jest.spyOn(sftpClient, 'rename');
    existsSftpSpy = jest.spyOn(sftpClient, 'exists');
    connectSftpSpy = jest.spyOn(sftpClient, 'connect');
    statSpy = jest.spyOn(sftpClient, 'stat');
    endSpy = jest.spyOn(sftpClient, 'end');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('upload()', () => {
    it('should upload', async () => {
      const contents = Buffer.from('hello', 'utf8');
      const path = '/remote/greetings/hello.txt';
      const writeStreamOptions: SftpClient.WriteStreamOptions = {};
      putSftpSpy.mockReturnValue(Promise.resolve('success'));
      await service.upload(contents, path, writeStreamOptions);
      expect(putSftpSpy).toHaveBeenCalledTimes(1);
      expect(putSftpSpy).toHaveBeenCalledWith(contents, path, {
        writeStreamOptions,
      });
    });
  });
  describe('list()', () => {
    it('should list', async () => {
      const remoteDirectory = '/remote/greetings';
      const fileInfo: SftpClient.FileInfo[] = [
        {
          type: '-',
          name: 'screwoff.json',
          size: 1000,
          modifyTime: 1565809762,
          accessTime: 1565809762,
          rights: {
            user: 'all',
            group: 'all',
            other: 'all',
          },
          owner: 2,
          group: 3,
        },
      ];
      listSftpSpy.mockReturnValue(Promise.resolve(fileInfo));
      const response = await service.list(remoteDirectory);
      expect(response).toEqual(fileInfo);
      expect(listSftpSpy).toHaveBeenCalledTimes(1);
      expect(listSftpSpy).toHaveBeenCalledWith(remoteDirectory);
    });
  });
  describe('download()', () => {
    it('should download', async () => {
      const path = '/remote/greetings/hello.txt';
      const destination = '/usr/ben/local/greetings/hello.txt';
      const buffer = Buffer.from('Hello butthead!', 'utf8');
      const writeStreamOptions: SftpClient.WriteStreamOptions = {};
      getSftpSpy.mockReturnValue(Promise.resolve(buffer));
      const response = await service.download(
        path,
        destination,
        writeStreamOptions,
      );
      expect(response).toEqual(buffer);
      expect(getSftpSpy).toHaveBeenCalledTimes(1);
      expect(getSftpSpy).toHaveBeenCalledWith(path, destination, {
        writeStreamOptions,
      });
    });
  });
  describe('delete()', () => {
    it('should delete', async () => {
      const path = '/remote/greetings/hello.txt';
      deleteSftpSpy.mockReturnValue(Promise.resolve('success'));
      await service.delete(path);
      expect(deleteSftpSpy).toBeCalledTimes(1);
      expect(deleteSftpSpy).toHaveBeenCalledWith(path);
    });
  });
  describe('makeDirectory()', () => {
    it('should make a directory', async () => {
      const directory = '/remote/greetings';
      makedirectorySftpSpy.mockReturnValue(Promise.resolve('success'));
      await service.makeDirectory(directory);
      expect(makedirectorySftpSpy).toBeCalledTimes(1);
      expect(makedirectorySftpSpy).toHaveBeenCalledWith(directory, true);
    });
  });
  describe('removeDirectory()', () => {
    it('should remove a directory', async () => {
      const directory = '/remote/greetings';
      removeDirectorySftpSpy.mockReturnValue(Promise.resolve('success'));
      await service.removeDirectory(directory);
      expect(removeDirectorySftpSpy).toHaveBeenCalledTimes(1);
      expect(removeDirectorySftpSpy).toHaveBeenCalledWith(directory, true);
    });
  });
  describe('rename()', () => {
    it('should rename files', async () => {
      const sourceFile = '/remote/greetings/mean.txt';
      const destFile = '/remote/greetings/nice.txt';
      renameSftpSpy.mockReturnValue(Promise.resolve('success'));
      await service.rename(sourceFile, destFile);
      expect(renameSftpSpy).toHaveBeenCalledTimes(1);
      expect(renameSftpSpy).toHaveBeenCalledWith(sourceFile, destFile);
    });
  });
  describe('exists()', () => {
    it('should check if file exists', async () => {
      const remotePath = '/remote/greetings/mean.txt';
      existsSftpSpy.mockReturnValue(Promise.resolve(false));
      const noFileResult = await service.exists(remotePath);
      expect(noFileResult).toEqual(false);
      expect(existsSftpSpy).toHaveBeenCalledTimes(1);
      expect(existsSftpSpy).toHaveBeenCalledWith(remotePath);

      existsSftpSpy.mockReturnValue(Promise.resolve('-'));
      const fileResult = await service.exists(remotePath);
      expect(fileResult).toEqual('-');
    });
  });
  describe('connect()', () => {
    it('should connect', async () => {
      const config: ConnectConfig = {
        host: 'fakehost.faker.com',
        port: 2023,
      };
      connectSftpSpy.mockReturnValue(Promise.resolve(null));
      await service.connect(config);
      expect(connectSftpSpy).toHaveBeenCalledTimes(1);
      expect(connectSftpSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('resetConnection()', () => {
    it('should connect', async () => {
      const config: ConnectConfig = {
        host: 'fakehost.faker.com',
        port: 2023,
      };
      endSpy.mockRejectedValue({ code: 'ERR_NOT_CONNECTED' });
      connectSftpSpy.mockReturnValue(Promise.resolve(null));

      await service.resetConnection(config);
      expect(endSpy).toHaveBeenCalledTimes(1);
      expect(connectSftpSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('stat()', () => {
    it('should retrieve file info', async () => {
      const remoteFilePath = '/test-remote/filepath.txt';
      statSpy.mockReturnValue(Promise.resolve({}));
      await service.stat(remoteFilePath);
      expect(statSpy).toHaveBeenCalledTimes(1);
      expect(statSpy).toHaveBeenCalledWith(remoteFilePath);
    });
  });

  describe('disconnect()', () => {
    it('should end connection', async () => {
      endSpy.mockReturnValue(Promise.resolve());
      await service.disconnect();
      expect(endSpy).toHaveBeenCalledTimes(1);
    });
  });
});
