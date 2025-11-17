import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Custom Playwright reporter that automatically generates narrated videos
 * after test execution completes.
 */
class NarrationReporter implements Reporter {
  private hasVideos = false;

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`\n🎙️  Narration Reporter: Monitoring test execution...`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Check if this test has video attachments
    const hasVideo = result.attachments.some(
      attachment => attachment.name === 'video' || attachment.contentType === 'video/webm'
    );
    
    if (hasVideo) {
      this.hasVideos = true;
    }
  }

  async onEnd(result: FullResult) {
    if (!this.hasVideos) {
      console.log('🎙️  Narration Reporter: No videos recorded, skipping narration.');
      return;
    }

    // Check if Speech API is configured
    if (!process.env.SPEECH_KEY || process.env.SPEECH_KEY === 'YOUR_SPEECH_KEY') {
      console.log('\n⚠️  Narration Reporter: SPEECH_KEY not configured. Skipping narration.');
      console.log('   To enable narration, set: export SPEECH_KEY=your_azure_speech_key');
      console.log('   And: export SPEECH_REGION=your_region (e.g., eastus)');
      return;
    }

    console.log('\n🎙️  Narration Reporter: Generating narrated videos...');
    
    try {
      const scriptPath = path.join(__dirname, 'add-narration.js');
      const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
        env: {
          ...process.env,
        },
      });
      
      if (stdout) {
        console.log(stdout);
      }
      
      if (stderr && !stderr.includes('Warning')) {
        console.error(stderr);
      }
      
      console.log('✅ Narration Reporter: Video narration complete!');
    } catch (error) {
      console.error('❌ Narration Reporter: Failed to generate narrated videos');
      console.error(error instanceof Error ? error.message : error);
    }
  }

  printsToStdio() {
    return true;
  }
}

export default NarrationReporter;
