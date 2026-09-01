import { cn, formatTimeAgo, formatCurrency, formatFileSize, toNumber } from '../utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6');
  });
});

describe('formatTimeAgo', () => {
  it('should return "Just now" for recent dates', () => {
    const now = new Date().toISOString();
    expect(formatTimeAgo(now)).toBe('Just now');
  });

  it('should return minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatTimeAgo(fiveMinAgo)).toBe('5m ago');
  });

  it('should return hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60000).toISOString();
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
  });

  it('should return days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString();
    expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
  });
});

describe('formatCurrency', () => {
  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format large amounts', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatFileSize', () => {
  it('should return "0 B" for zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should format terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1 TB');
  });
});

describe('toNumber', () => {
  it('should return 0 for null', () => {
    expect(toNumber(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(toNumber(undefined)).toBe(0);
  });

  it('should return number as-is', () => {
    expect(toNumber(42)).toBe(42);
  });

  it('should parse numeric strings', () => {
    expect(toNumber('3.14')).toBe(3.14);
  });

  it('should parse object with toString', () => {
    expect(toNumber({ toString: () => '99' })).toBe(99);
  });

  it('should return 0 for unparseable values', () => {
    expect(toNumber('abc')).toBeNaN();
  });
});
