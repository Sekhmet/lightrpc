import Client from '../lib/lightrpc';

describe('createClient', () => {
  it('should return an client', () => {
    const client = new Client('https://api.steemit.com');
    expect(typeof client).toBe('object');
    expect(typeof client.send).toBe('function');
    expect(typeof client.sendBatch).toBe('function');
  });

  it('should throw errors', done => {
    const request = {
      method: 'not_existing_method',
      params: [],
    };

    const client = new Client('https://api.steemit.com');
    client.send(request, (err, res) => {
      expect(err instanceof Error).toBe(true);
      expect(res).toBe(null);

      done();
    });
  });

  it('should handle single request using call', done => {
    const client = new Client('https://api.steemit.com');
    client.call('get_accounts', [['sekhmet']], (err, res) => {
      expect(err).toBe(null);
      expect(res[0].id).toBe(168165);

      done();
    });
  });

  it('should handle single request using send', done => {
    const request = {
      method: 'get_accounts',
      params: [['sekhmet']],
    };

    const client = new Client('https://api.steemit.com');
    client.send(request, (err, res) => {
      expect(err).toBe(null);
      expect(res[0].id).toBe(168165);

      done();
    });
  });

  it('should handle multiple requests', done => {
    const requests = [
      {
        method: 'get_accounts',
        params: [['sekhmet']],
      },
      {
        method: 'get_config',
        params: [],
      },
    ];

    const client = new Client('https://api.steemit.com');
    client.sendBatch(requests, (err, res) => {
      expect(err).toBe(null);

      const respA = res[0];
      const respB = res[1];

      expect(respA[0].id).toBe(168165);
      expect(respB.IS_TEST_NET).toBe(false);

      done();
    });
  });
});
