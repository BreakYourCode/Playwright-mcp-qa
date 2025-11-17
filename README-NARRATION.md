# 🎙️ Video Narration for Playwright Tests

This utility automatically generates narration and merges it with Playwright test recordings using Azure Cognitive Services Speech API and ffmpeg.

## ✨ Automatic Narration (Recommended)

Narration is **automatically enabled** when you configure Azure Speech credentials. No manual script execution needed!

### 1. Set up Azure Speech Service

1. Create an Azure account at [portal.azure.com](https://portal.azure.com)
2. Create a Speech Service resource
3. Copy your API key and region

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Add to your shell profile (.bashrc, .zshrc, etc.) or set before running tests
export SPEECH_KEY=your_azure_speech_key
export SPEECH_REGION=eastus  # or your region
```

### 3. Run Tests - Narration Happens Automatically!

```bash
# Just run your tests normally
npm test

# Narrated videos will be generated automatically in narrated-videos/
```

## 📋 Manual Narration (Optional)

If you need to re-narrate existing videos or run narration separately:

```bash
# Process all videos in test-results directory
npm run narrate

# Specify custom directories
node utils/add-narration.js ./test-results ./output-videos
```

## 📋 How It Works

1. **Finds Videos**: Scans `test-results/` for `.webm` files
2. **Extracts Info**: Reads test name and error context from directory structure
3. **Generates Script**: Creates narration text describing the test
4. **Text-to-Speech**: Uses Azure Speech API to generate audio (`.wav`)
5. **Merges Media**: Uses ffmpeg to combine video + audio → `.mp4`
6. **Outputs**: Saves narrated videos to `narrated-videos/` directory

## 🎯 Features

- ✅ Automatic test result parsing
- ✅ Natural-sounding voice narration (Azure Neural Voices)
- ✅ Describes test name, status, errors, and duration
- ✅ Preserves original video quality (codec copy)
- ✅ Batch processing for multiple videos
- ✅ Cleans up temporary audio files

## 📝 Example Narration

For a failed test, the narration might be:

> "Test: US Cuisinart login. Status: Failed. Error: Timeout waiting for login button. Step 1: Navigate to stage cuisinart.com. Step 2: Click account link. Step 3: Fill login form. Failed at this step: Element not found. Total duration: 15.3 seconds."

## 🎤 Voice Options

Edit `utils/add-narration.js` to change the voice:

```javascript
// Available voices:
speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';  // Female (default)
// speechConfig.speechSynthesisVoiceName = 'en-US-GuyNeural';     // Male
// speechConfig.speechSynthesisVoiceName = 'en-US-AriaNeural';    // Female
// speechConfig.speechSynthesisVoiceName = 'en-GB-RyanNeural';    // British Male
```

See [Azure Voice Gallery](https://speech.microsoft.com/portal/voicegallery) for all options.

## 🛠️ Requirements

- Node.js 14+
- ffmpeg (installed via `apt-get install ffmpeg`)
- Azure Speech Service subscription (Free tier available)

## 💰 Costs

Azure Speech Service Free Tier:
- 500,000 characters/month free
- ~10,000 test narrations/month (assuming 50 chars each)

## 🔧 Customization

### Custom Narration Script

Edit the `generateNarrationScript()` function in `utils/add-narration.js`:

```javascript
function generateNarrationScript(testName, testResults) {
  // Add your custom narration logic here
  const script = [];
  script.push(`Testing ${testName} on ${new Date().toLocaleDateString()}`);
  // ... more customization
  return script.join('. ');
}
```

### Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Generate Narrated Videos
  env:
    SPEECH_KEY: ${{ secrets.AZURE_SPEECH_KEY }}
    SPEECH_REGION: ${{ secrets.AZURE_SPEECH_REGION }}
  run: npm run narrate

- name: Upload Narrated Videos
  uses: actions/upload-artifact@v4
  with:
    name: narrated-test-videos
    path: narrated-videos/
```

## 🐛 Troubleshooting

### "SPEECH_KEY environment variable not set"

```bash
export SPEECH_KEY=your_key_here
export SPEECH_REGION=eastus
```

### "ffmpeg: command not found"

```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
```

### "Could not find tag for codec vp8 in stream" (Fixed!)

This error occurred because Playwright videos use VP8 codec (WebM format), which isn't compatible with MP4 containers. The script now automatically re-encodes videos to H.264 format for MP4 compatibility.

**What the fix does:**
- Changed ffmpeg command from `-c:v copy` (stream copy) to `-c:v libx264 -preset fast -crf 22` (re-encode)
- Videos are converted from VP8 (WebM) to H.264 (MP4) during narration merge
- Quality is preserved with CRF 22 (visually lossless)

### "Speech synthesis failed"

- Check your Azure subscription is active
- Verify the API key and region are correct
- Ensure you haven't exceeded free tier limits

### No videos found

- Run Playwright tests first: `npm test`
- Check that videos are enabled in `playwright.config.ts`
- Verify test results are in `./test-results/`

## 📚 Resources

- [Azure Speech Service](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/)
- [Speech SDK Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [ffmpeg Documentation](https://ffmpeg.org/documentation.html)

## 🤝 Contributing

Feel free to enhance the narration script with:
- More detailed step descriptions
- Timing information for each action
- Screenshot descriptions
- Test data summaries
