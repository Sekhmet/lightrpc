import { createClient } from '../src/index';

describe('createClient', () => {
  it('should return an client', () => {
    const client = createClient('https://api.steemit.com');
    expect(typeof client).toBe('object');
    expect(typeof client.send).toBe('function');
  });

  it('should throw errors', (done) => {
    const client = createClient('https://api.steemit.com');
    client.send('not_existing_method', [], (err, res) => {
      expect(err instanceof Error).toBe(true);
      expect(res).toBe(null);
      done();
    });
  });

  it('should return response', (done) => {
    const client = createClient('https://api.steemit.com');
    client.send('get_accounts', [['sekhmet']], (err, res) => {
      expect(err).toBe(null);
      expect(res instanceof Array).toBe(true);
      done();
    });
  });
});
