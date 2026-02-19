import { generateTemporaryPassword, DEFAULT_AVAILABLE_HOURS } from '../src/utils/helpers';

describe('Helpers', () => {
  describe('generateTemporaryPassword', () => {
    it('should generate a password with default length of 8', () => {
      const password = generateTemporaryPassword();
      expect(password).toHaveLength(8);
    });

    it('should generate a password with custom length', () => {
      const password = generateTemporaryPassword(12);
      expect(password).toHaveLength(12);
    });

    it('should generate different passwords each time', () => {
      const password1 = generateTemporaryPassword();
      const password2 = generateTemporaryPassword();
      expect(password1).not.toBe(password2);
    });
  });

  describe('DEFAULT_AVAILABLE_HOURS', () => {
    it('should have 8 hours (commercial hours)', () => {
      expect(DEFAULT_AVAILABLE_HOURS).toHaveLength(8);
    });

    it('should contain morning hours (08:00 to 11:00)', () => {
      expect(DEFAULT_AVAILABLE_HOURS).toContain('08:00');
      expect(DEFAULT_AVAILABLE_HOURS).toContain('09:00');
      expect(DEFAULT_AVAILABLE_HOURS).toContain('10:00');
      expect(DEFAULT_AVAILABLE_HOURS).toContain('11:00');
    });

    it('should contain afternoon hours (14:00 to 17:00)', () => {
      expect(DEFAULT_AVAILABLE_HOURS).toContain('14:00');
      expect(DEFAULT_AVAILABLE_HOURS).toContain('15:00');
      expect(DEFAULT_AVAILABLE_HOURS).toContain('16:00');
      expect(DEFAULT_AVAILABLE_HOURS).toContain('17:00');
    });
  });
});
