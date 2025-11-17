const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

const execPromise = util.promisify(exec);

// Azure Speech Service configuration
// Set these environment variables: SPEECH_KEY and SPEECH_REGION
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.SPEECH_KEY || 'YOUR_SPEECH_KEY',
  process.env.SPEECH_REGION || 'YOUR_REGION'
);

// Configure voice (options: en-US-JennyNeural, en-US-GuyNeural, en-US-AriaNeural, etc.)
speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';

/**
 * Generate narration script from test results
 */
function generateNarrationScript(testName, testResults) {
  const script = [];
  
  script.push(`Test: ${testName}`);
  
  if (testResults.status === 'passed') {
    script.push('Status: Passed successfully');
  } else if (testResults.status === 'failed') {
    script.push('Status: Failed');
    if (testResults.error) {
      script.push(`Error: ${testResults.error}`);
    }
  }
  
  if (testResults.steps && testResults.steps.length > 0) {
    script.push('Test steps:');
    testResults.steps.forEach((step, index) => {
      script.push(`Step ${index + 1}: ${step.title}`);
      if (step.error) {
        script.push(`Failed at this step: ${step.error}`);
      }
    });
  }
  
  if (testResults.duration) {
    const seconds = (testResults.duration / 1000).toFixed(1);
    script.push(`Total duration: ${seconds} seconds`);
  }
  
  return script.join('. ');
}

/**
 * Generate speech from text using Azure Cognitive Services
 */
async function textToSpeech(text, outputPath) {
  return new Promise((resolve, reject) => {
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    
    console.log(`Generating narration: "${text.substring(0, 50)}..."`);
    
    synthesizer.speakTextAsync(
      text,
      result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log(`✓ Narration saved to: ${outputPath}`);
          synthesizer.close();
          resolve(outputPath);
        } else {
          const error = `Speech synthesis failed: ${result.errorDetails}`;
          console.error(error);
          synthesizer.close();
          reject(new Error(error));
        }
      },
      error => {
        console.error(`Error: ${error}`);
        synthesizer.close();
        reject(error);
      }
    );
  });
}

/**
 * Merge audio and video using ffmpeg
 */
async function mergeAudioVideo(videoPath, audioPath, outputPath) {
  console.log(`Merging audio and video...`);
  
  // Re-encode VP8 video to H.264 for MP4 compatibility
  const command = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v libx264 -preset fast -crf 22 -c:a aac -shortest "${outputPath}" -y`;
  
  try {
    const { stdout, stderr } = await execPromise(command);
    console.log(`✓ Narrated video created: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error merging audio/video: ${error.message}`);
    throw error;
  }
}

/**
 * Parse Playwright test results from JSON
 */
function parseTestResults(resultsPath) {
  try {
    const data = fs.readFileSync(resultsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading test results: ${error.message}`);
    return null;
  }
}

/**
 * Find video files in test results directory
 */
function findVideoFiles(testResultsDir) {
  const videos = [];
  
  function searchDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.webm')) {
        videos.push(fullPath);
      }
    }
  }
  
  if (fs.existsSync(testResultsDir)) {
    searchDir(testResultsDir);
  }
  
  return videos;
}

/**
 * Extract test information from video path
 */
function extractTestInfo(videoPath) {
  const dirName = path.dirname(videoPath);
  const testName = path.basename(dirName);
  
  // Look for error-context.md in the same directory
  const errorContextPath = path.join(dirName, 'error-context.md');
  let error = null;
  
  if (fs.existsSync(errorContextPath)) {
    const errorContent = fs.readFileSync(errorContextPath, 'utf8');
    // Extract first line as error summary
    error = errorContent.split('\n')[0].replace(/^#+\s*/, '');
  }
  
  return {
    testName: testName.replace(/-/g, ' '),
    status: error ? 'failed' : 'passed',
    error: error,
    steps: [] // Could be enhanced to parse actual steps from trace
  };
}

/**
 * Main function to process all test videos
 */
async function processTestVideos(testResultsDir = './test-results', outputDir = './narrated-videos') {
  console.log('🎬 Starting video narration process...\n');
  
  // Check if Speech API is configured
  if (!process.env.SPEECH_KEY || process.env.SPEECH_KEY === 'YOUR_SPEECH_KEY') {
    console.error('❌ Error: SPEECH_KEY environment variable not set');
    console.log('Set it with: export SPEECH_KEY=your_azure_speech_key');
    console.log('And: export SPEECH_REGION=your_region (e.g., eastus)');
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Find all video files
  const videos = findVideoFiles(testResultsDir);
  
  if (videos.length === 0) {
    console.log('No video files found in test results.');
    return;
  }
  
  console.log(`Found ${videos.length} video(s) to process\n`);
  
  // Process each video
  for (const videoPath of videos) {
    try {
      console.log(`\n📹 Processing: ${path.basename(videoPath)}`);
      
      // Extract test information
      const testInfo = extractTestInfo(videoPath);
      
      // Generate narration script
      const narrationText = generateNarrationScript(testInfo.testName, testInfo);
      
      // Generate audio file
      const audioPath = path.join(outputDir, `narration-${Date.now()}.wav`);
      await textToSpeech(narrationText, audioPath);
      
      // Merge audio and video
      // Use parent directory name + video name for unique filename
      const parentDir = path.basename(path.dirname(videoPath));
      const outputFileName = `${parentDir}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);
      
      await mergeAudioVideo(videoPath, audioPath, outputPath);
      
      // Clean up temporary audio file
      fs.unlinkSync(audioPath);
      
      console.log(`✅ Completed: ${outputFileName}\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${videoPath}: ${error.message}\n`);
    }
  }
  
  console.log('\n🎉 Narration process completed!');
  console.log(`📁 Output directory: ${path.resolve(outputDir)}`);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const testResultsDir = args[0] || './test-results';
  const outputDir = args[1] || './narrated-videos';
  
  processTestVideos(testResultsDir, outputDir)
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  generateNarrationScript,
  textToSpeech,
  mergeAudioVideo,
  processTestVideos
};
