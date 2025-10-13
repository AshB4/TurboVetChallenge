import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayloadDto, Role } from '@vettech/data';

describe('JwtStrategy', () => {
  it('returns payload as validated user', async () => {
    const config = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);
    const payload: JwtPayloadDto = {
      sub: '1',
      username: 'owner@turbovet.test',
      organizationId: 'org',
      roles: [Role.ADMIN],
    };
    await expect(strategy.validate(payload)).resolves.toEqual(payload);
  });

  it('uses default secret when not configured', () => {
    const get = jest.fn().mockReturnValueOnce(undefined);
    const config = { get } as unknown as ConfigService;
    expect(() => new JwtStrategy(config)).not.toThrow();
  });

  it('rejects payloads missing required claims or roles', async () => {
    const config = { get: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);
    await expect(strategy.validate({} as any)).rejects.toThrow(UnauthorizedException);
    await expect(
      strategy.validate({ sub: '1', username: 'user', organizationId: 'org', roles: [] } as any),
    ).rejects.toThrow('Token is missing role assignments');
  });
});
