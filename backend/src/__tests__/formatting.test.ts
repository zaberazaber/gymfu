import {
  formatCurrency,
  formatDistance,
  formatDuration,
  truncateText,
  capitalizeFirst,
  formatPercentage,
} from '../../../shared/utils/formatting';

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency in INR', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(50000)).toBe('₹50,000');
      expect(formatCurrency(100)).toBe('₹100');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('₹10,00,000');
    });
  });

  describe('formatDistance', () => {
    it('should format distances in meters', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format distances in kilometers', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(5000)).toBe('5.0km');
    });

    it('should handle zero', () => {
      expect(formatDistance(0)).toBe('0m');
    });
  });

  describe('formatDuration', () => {
    it('should format durations in minutes', () => {
      expect(formatDuration(30)).toBe('30min');
      expect(formatDuration(45)).toBe('45min');
      expect(formatDuration(59)).toBe('59min');
    });

    it('should format durations in hours', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format durations in hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30min');
      expect(formatDuration(150)).toBe('2h 30min');
    });

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0min');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncateText(text, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exact length';
      expect(truncateText(text, 12)).toBe('Exact length');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('world')).toBe('World');
    });

    it('should lowercase rest of the string', () => {
      expect(capitalizeFirst('HELLO')).toBe('Hello');
      expect(capitalizeFirst('hELLO')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with default decimals', () => {
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(75.5)).toBe('76%');
    });

    it('should format percentages with specified decimals', () => {
      expect(formatPercentage(50.5, 1)).toBe('50.5%');
      expect(formatPercentage(75.555, 2)).toBe('75.56%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should handle 100', () => {
      expect(formatPercentage(100)).toBe('100%');
    });
  });
});
