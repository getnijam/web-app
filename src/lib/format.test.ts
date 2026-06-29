import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  repoFromUrl,
  displayFile,
  isPlaceholderEmail,
  displayAuthor,
} from './format';

describe('formatDuration', () => {
  it('shows seconds-only under a minute', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(0)).toBe('0s');
  });

  it('shows minutes + seconds at or above a minute', () => {
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(83)).toBe('1m 23s');
  });

  it('rounds and floors negatives to zero', () => {
    expect(formatDuration(45.6)).toBe('46s');
    expect(formatDuration(-5)).toBe('0s');
  });
});

describe('repoFromUrl', () => {
  it('reduces https and git@ remotes to org/repo', () => {
    expect(repoFromUrl('https://github.com/getnijam/web-app')).toBe('getnijam/web-app');
    expect(repoFromUrl('https://github.com/getnijam/web-app.git')).toBe('getnijam/web-app');
    expect(repoFromUrl('git@github.com:getnijam/web-app.git')).toBe('getnijam/web-app');
  });

  it('strips www and trailing slashes', () => {
    expect(repoFromUrl('https://www.gitlab.com/org/repo/')).toBe('org/repo');
  });

  it('returns empty string for nullish input', () => {
    expect(repoFromUrl(null)).toBe('');
    expect(repoFromUrl(undefined)).toBe('');
    expect(repoFromUrl('')).toBe('');
  });
});

describe('displayFile', () => {
  it('keeps short relative paths as-is', () => {
    expect(displayFile('e2e/login.spec.ts')).toBe('e2e/login.spec.ts');
    expect(displayFile('apps/web/auth.spec.ts')).toBe('apps/web/auth.spec.ts');
  });

  it('middle-ellipsizes deep relative paths to first folder + filename', () => {
    expect(displayFile('apps/product-frontend/apps/web-ui/qa/document-chat.spec.ts')).toBe(
      'apps/…/document-chat.spec.ts',
    );
  });

  it('collapses absolute posix + windows paths to the basename', () => {
    expect(displayFile('/home/runner/_work/app/foo.spec.ts')).toBe('foo.spec.ts');
    expect(displayFile('C:\\Users\\ci\\bar.test.ts')).toBe('bar.test.ts');
  });
});

describe('isPlaceholderEmail', () => {
  it('flags git auto-generated hostnames', () => {
    expect(isPlaceholderEmail('user@Akhils-MacBook-Pro.local')).toBe(true);
    expect(isPlaceholderEmail('runner@localhost')).toBe(true);
    expect(isPlaceholderEmail('not-an-email')).toBe(true);
  });

  it('accepts real addresses', () => {
    expect(isPlaceholderEmail('akhil@nijam.dev')).toBe(false);
  });
});

describe('displayAuthor', () => {
  it('prefers a real email', () => {
    expect(displayAuthor('akhil@nijam.dev', 'Akhil')).toBe('akhil@nijam.dev');
  });

  it('falls back to the name when the email is a placeholder', () => {
    expect(displayAuthor('user@host.local', 'Akhil')).toBe('Akhil');
  });

  it('falls back to the email local-part, then "unknown"', () => {
    expect(displayAuthor('user@host.local', null)).toBe('user');
    expect(displayAuthor(null, null)).toBe('unknown');
  });
});
