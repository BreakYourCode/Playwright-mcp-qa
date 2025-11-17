import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class ConsoleLoggerReporter implements Reporter {
  private testLogs: Map<string, string[]> = new Map();

  onTestBegin(test: TestCase) {
    const testId = this.getTestId(test);
    this.testLogs.set(testId, []);
  }

  onStdOut(chunk: string | Buffer, test?: TestCase) {
    if (test) {
      const testId = this.getTestId(test);
      const logs = this.testLogs.get(testId) || [];
      const text = chunk.toString();
      
      // Filter out debug/noise and keep meaningful logs
      const cleanText = text.trim();
      if (cleanText && 
          !cleanText.includes('[dotenv') && 
          !cleanText.includes('injecting env') &&
          !cleanText.includes('Page URL:') &&
          !cleanText.includes('Page title:')) {
        logs.push(cleanText);
        this.testLogs.set(testId, logs);
      }
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testId = this.getTestId(test);
    const logs = this.testLogs.get(testId) || [];
    
    if (logs.length > 0 && result.attachments) {
      // Find the output directory for this test
      const outputPath = this.findTestOutputPath(test, result);
      
      if (outputPath) {
        const logFilePath = path.join(outputPath, 'console-logs.txt');
        try {
          fs.writeFileSync(logFilePath, logs.join('\n'));
          console.log(`📝 Console logs saved to: ${logFilePath}`);
        } catch (error) {
          console.error(`Failed to save console logs: ${error}`);
        }
      }
    }
  }

  private getTestId(test: TestCase): string {
    return `${test.parent.title}:${test.title}`;
  }

  private findTestOutputPath(test: TestCase, result: TestResult): string | null {
    // Look for attachments that might indicate the output directory
    for (const attachment of result.attachments) {
      if (attachment.path) {
        return path.dirname(attachment.path);
      }
    }
    return null;
  }
}

export default ConsoleLoggerReporter;
