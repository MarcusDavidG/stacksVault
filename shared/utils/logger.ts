export class Logger {
  log(level: string, message: string, data?: any) {
    console.log(`[${level}] ${message}`, data || '');
  }

  error(message: string, error?: any) {
    this.log('ERROR', message, error);
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  debug(message: string, data?: any) {
    this.log('DEBUG', message, data);
  }
}
