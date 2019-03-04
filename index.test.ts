import * as badger from './index'

test('Get badges for known repository', async () => {
  const received = await badger.getBadges('47ng/badger')
  const expected = [
    {
      description: 'MIT License',
      image: 'https://img.shields.io/github/license/47ng/badger.svg?color=blue',
      url: 'https://github.com/47ng/badger/blob/master/LICENSE'
    },
    {
      description: 'Travis CI Build',
      image: 'https://img.shields.io/travis/com/47ng/badger.svg',
      url: 'https://travis-ci.com/47ng/badger'
    },
    {
      description: 'Average issue resolution time',
      image: 'https://isitmaintained.com/badge/resolution/47ng/badger.svg',
      url: 'https://isitmaintained.com/project/47ng/badger'
    },
    {
      description: 'Number of open issues',
      image: 'https://isitmaintained.com/badge/open/47ng/badger.svg',
      url: 'https://isitmaintained.com/project/47ng/badger'
    }
  ]
  expect(received).toEqual(expected)
})

test('Get badges for unknown repository', async () => {
  try {
    await badger.getBadges('47ng/definitelydoesnotexist')
  } catch (error) {
    expect(error.message).toBe('Repository not found')
  }
})
