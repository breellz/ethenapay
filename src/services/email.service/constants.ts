export const EMAIL_PRIORITY = {
  high: { backoff: 5000 },
  medium: { attempts: 20, backoff: 1000 },
  normal: { attempts: 10, backoff: 5000 },
  low: { attempts: 3, backoff: 10000 },
};

