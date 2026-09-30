const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const googleTTS = require('google-tts-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for in-memory PDF uploads (max 35MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 35 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported!'), false);
    }
  },
});

// Comprehensive list of supported languages with codes, flags, native names, and TTS mapping (70+ languages)
const SUPPORTED_LANGUAGES = [
  // Major Global Languages
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', ttsLang: 'en' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', ttsLang: 'es' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', ttsLang: 'fr' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', ttsLang: 'de' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', ttsLang: 'hi' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳', ttsLang: 'zh-CN' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文', flag: '🇹🇼', ttsLang: 'zh-TW' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', ttsLang: 'ja' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', ttsLang: 'ko' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', ttsLang: 'it' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', ttsLang: 'pt' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', ttsLang: 'ru' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', ttsLang: 'ar' },

  // South Asian & Indic Languages
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', ttsLang: 'bn' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', ttsLang: 'te' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', ttsLang: 'ta' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', ttsLang: 'mr' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', ttsLang: 'gu' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', ttsLang: 'kn' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', ttsLang: 'ml' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', ttsLang: 'pa' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', ttsLang: 'ur' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '🇳🇵', ttsLang: 'ne' },
  { code: 'si', name: 'Sinhala', native: 'සිංහල', flag: '🇱🇰', ttsLang: 'si' },

  // Southeast & East Asian Languages
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', ttsLang: 'id' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', ttsLang: 'ms' },
  { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭', ttsLang: 'th' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', ttsLang: 'vi' },
  { code: 'tl', name: 'Filipino (Tagalog)', native: 'Tagalog', flag: '🇵🇭', ttsLang: 'tl' },
  { code: 'km', name: 'Khmer', native: 'ភាសាខ្មែរ', flag: '🇰🇭', ttsLang: 'km' },
  { code: 'my', name: 'Burmese', native: 'မြန်မာစာ', flag: '🇲🇲', ttsLang: 'my' },
  { code: 'jw', name: 'Javanese', native: 'Basa Jawa', flag: '🇮🇩', ttsLang: 'jw' },
  { code: 'su', name: 'Sundanese', native: 'Basa Sunda', flag: '🇮🇩', ttsLang: 'su' },

  // European Languages
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', ttsLang: 'nl' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', ttsLang: 'tr' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', ttsLang: 'pl' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦', ttsLang: 'uk' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', ttsLang: 'el' },
  { code: 'cs', name: 'Czech', native: 'Čeština', flag: '🇨🇿', ttsLang: 'cs' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', ttsLang: 'sv' },
  { code: 'da', name: 'Danish', native: 'Dansk', flag: '🇩🇰', ttsLang: 'da' },
  { code: 'fi', name: 'Finnish', native: 'Suomi', flag: '🇫🇮', ttsLang: 'fi' },
  { code: 'no', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴', ttsLang: 'no' },
  { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', ttsLang: 'he' },
  { code: 'ro', name: 'Romanian', native: 'Română', flag: '🇷🇴', ttsLang: 'ro' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺', ttsLang: 'hu' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina', flag: '🇸🇰', ttsLang: 'sk' },
  { code: 'bg', name: 'Bulgarian', native: 'Български', flag: '🇧🇬', ttsLang: 'bg' },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski', flag: '🇭🇷', ttsLang: 'hr' },
  { code: 'sr', name: 'Serbian', native: 'Српски', flag: '🇷🇸', ttsLang: 'sr' },
  { code: 'sl', name: 'Slovenian', native: 'Slovenščina', flag: '🇸🇮', ttsLang: 'sl' },
  { code: 'lt', name: 'Lithuanian', native: 'Lietuvių', flag: '🇱🇹', ttsLang: 'lt' },
  { code: 'lv', name: 'Latvian', native: 'Latviešu', flag: '🇱🇻', ttsLang: 'lv' },
  { code: 'et', name: 'Estonian', native: 'Eesti', flag: '🇪🇪', ttsLang: 'et' },
  { code: 'is', name: 'Icelandic', native: 'Íslenska', flag: '🇮🇸', ttsLang: 'is' },
  { code: 'ga', name: 'Irish', native: 'Gaeilge', flag: '🇮🇪', ttsLang: 'ga' },
  { code: 'cy', name: 'Welsh', native: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', ttsLang: 'cy' },
  { code: 'sq', name: 'Albanian', native: 'Shqip', flag: '🇦🇱', ttsLang: 'sq' },
  { code: 'mk', name: 'Macedonian', native: 'Македонски', flag: '🇲🇰', ttsLang: 'mk' },
  { code: 'bs', name: 'Bosnian', native: 'Bosanski', flag: '🇧🇦', ttsLang: 'bs' },
  { code: 'ca', name: 'Catalan', native: 'Català', flag: '🇪🇸', ttsLang: 'ca' },
  { code: 'eu', name: 'Basque', native: 'Euskara', flag: '🇪🇸', ttsLang: 'eu' },
  { code: 'gl', name: 'Galician', native: 'Galego', flag: '🇪🇸', ttsLang: 'gl' },
  { code: 'la', name: 'Latin', native: 'Latina', flag: '🏛️', ttsLang: 'la' },
  { code: 'eo', name: 'Esperanto', native: 'Esperanto', flag: '🌐', ttsLang: 'eo' },

  // Middle Eastern, Caucasian & African Languages
  { code: 'fa', name: 'Persian', native: 'فارسی', flag: '🇮🇷', ttsLang: 'fa' },
  { code: 'ka', name: 'Georgian', native: 'ქართული', flag: '🇬🇪', ttsLang: 'ka' },
  { code: 'hy', name: 'Armenian', native: 'Հայերեն', flag: '🇦🇲', ttsLang: 'hy' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', ttsLang: 'sw' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', ttsLang: 'af' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', ttsLang: 'zu' },
];

/**
 * Clean and normalize text extracted from PDF
 */
function cleanExtractedText(rawText) {
  if (!rawText) return '';
  return rawText
    // Remove standalone page footer markings like "-- 1 of 3 --"
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '')
    // Normalize unicode whitespace
    .replace(/[\r\t\f]/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/ {2,}/g, ' ')
    // Fix broken words split across line breaks (e.g. "con- \nnected" -> "connected")
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
    // Normalize multiple consecutive line breaks to max 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Intelligent chunking for long text documents to avoid translation API limits
 */
function splitTextIntoTranslationChunks(text, maxChunkLen = 1400) {
  if (!text || !text.trim()) return [];

  const paragraphs = text.split(/\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // If paragraph itself exceeds maxChunkLen, break by sentences
    if (trimmed.length > maxChunkLen) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      const sentences = trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [trimmed];
      let subChunk = '';
      for (const sent of sentences) {
        if ((subChunk + ' ' + sent).length > maxChunkLen) {
          if (subChunk) chunks.push(subChunk.trim());
          subChunk = sent;
        } else {
          subChunk = subChunk ? (subChunk + ' ' + sent) : sent;
        }
      }
      if (subChunk) chunks.push(subChunk.trim());
      continue;
    }

    if ((currentChunk + '\n' + trimmed).length > maxChunkLen) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? (currentChunk + '\n' + trimmed) : trimmed;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Primary translation engine with Google Translate API & MyMemory Fallback
 */
async function translateChunk(chunk, targetLang, sourceLang = 'auto') {
  // Strategy 1: Google Translate single API endpoint
  try {
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sourceLang
    )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(chunk)}`;

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const textResult = data[0].map(item => (item && item[0] ? item[0] : '')).join('');
        const detected = data[2] || sourceLang;
        return { text: textResult, detectedLang: detected };
      }
    }
  } catch (err) {
    console.warn('Google translation chunk failed, attempting fallback:', err.message);
  }

  // Strategy 2: MyMemory Translation API fallback
  try {
    const sl = sourceLang === 'auto' ? 'en' : sourceLang;
    const pair = `${sl}|${targetLang}`;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      chunk.substring(0, 500)
    )}&langpair=${encodeURIComponent(pair)}`;

    const mmRes = await fetch(myMemoryUrl);
    if (mmRes.ok) {
      const mmData = await mmRes.json();
      if (mmData && mmData.responseData && mmData.responseData.translatedText) {
        return { text: mmData.responseData.translatedText, detectedLang: sl };
      }
    }
  } catch (err) {
    console.error('MyMemory fallback error:', err.message);
  }

  // If both failed, return original chunk
  return { text: chunk, detectedLang: sourceLang };
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

/**
 * GET /api/languages - Returns supported languages
 */
app.get('/api/languages', (req, res) => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES,
    total: SUPPORTED_LANGUAGES.length,
  });
});

/**
 * POST /api/extract-pdf - Handles PDF Upload and Text Extraction
 */
app.post('/api/extract-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'No PDF file provided in request.' });
    }

    const pdfBuffer = req.file.buffer;
    const uint8Array = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);
    const parser = new PDFParse(uint8Array);
    await parser.load();

    const textResult = await parser.getText();
    const infoResult = await parser.getInfo().catch(() => ({}));

    await parser.destroy();

    const rawFullText = textResult && textResult.text ? textResult.text : '';
    const cleanedText = cleanExtractedText(rawFullText);

    // Break down by pages if available
    const pages = (textResult.pages || []).map(p => {
      const pageClean = cleanExtractedText(p.text || '');
      const words = pageClean.trim() ? pageClean.trim().split(/\s+/).length : 0;
      return {
        pageNumber: p.num,
        text: pageClean,
        wordCount: words,
      };
    });

    const words = cleanedText.trim() ? cleanedText.trim().split(/\s+/).length : 0;
    const chars = cleanedText.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

    res.json({
      success: true,
      filename: req.file.originalname,
      fileSize: req.file.size,
      totalPages: textResult.total || (pages.length ? pages.length : 1),
      wordCount: words,
      charCount: chars,
      estimatedReadingTime: `${readingTimeMinutes} min`,
      extractedText: cleanedText,
      pages,
      metadata: infoResult && infoResult.info ? infoResult.info : {},
    });
  } catch (err) {
    console.error('PDF parsing error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to extract text from PDF: ' + (err.message || 'Unknown error'),
    });
  }
});

/**
 * POST /api/analyze-text - Analyze arbitrary text
 */
app.post('/api/analyze-text', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'Text content is required' });
  }

  const cleaned = cleanExtractedText(text);
  const words = cleaned.trim() ? cleaned.trim().split(/\s+/).length : 0;
  const chars = cleaned.length;
  const sentences = cleaned.split(/[.!?]+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const speakingTime = Math.max(1, Math.ceil(words / 140));

  res.json({
    success: true,
    cleanedText: cleaned,
    wordCount: words,
    charCount: chars,
    sentenceCount: sentences,
    estimatedReadingTime: `${readingTime} min`,
    estimatedSpeakingTime: `${speakingTime} min`,
  });
});

/**
 * POST /api/translate - Translates text to target language
 */
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang, sourceLang = 'auto' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text to translate is required.' });
    }

    if (!targetLang) {
      return res.status(400).json({ success: false, error: 'Target language is required.' });
    }

    // Split text into safe chunks for translation
    const chunks = splitTextIntoTranslationChunks(text);
    if (chunks.length === 0) {
      return res.json({
        success: true,
        translatedText: '',
        detectedSourceLang: sourceLang,
        targetLang,
        wordCount: 0,
      });
    }

    const translatedPieces = [];
    let detectedLanguage = sourceLang;

    for (let i = 0; i < chunks.length; i++) {
      const result = await translateChunk(chunks[i], targetLang, sourceLang);
      translatedPieces.push(result.text);
      if (result.detectedLang && detectedLanguage === 'auto') {
        detectedLanguage = result.detectedLang;
      }
    }

    const fullTranslation = translatedPieces.join('\n\n');
    const wordCount = fullTranslation.trim() ? fullTranslation.trim().split(/\s+/).length : 0;

    res.json({
      success: true,
      translatedText: fullTranslation,
      detectedSourceLang: detectedLanguage,
      targetLang,
      chunksCount: chunks.length,
      wordCount,
      charCount: fullTranslation.length,
    });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({
      success: false,
      error: 'Translation processing failed: ' + (err.message || 'Unknown error'),
    });
  }
});

/**
 * POST /api/synthesize - Generates audio and returns base64 or stream
 */
app.post('/api/synthesize', async (req, res) => {
  try {
    const { text, lang = 'en', speed = 1.0, returnFormat = 'json' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text for synthesis is required.' });
    }

    // Limit synthesis length to safe bounds (up to 4000 characters per single call)
    const synthesisText = text.trim().substring(0, 4000);
    const slowMode = Number(speed) < 0.85;

    // Map target lang to closest google TTS code if needed
    let ttsLang = lang;
    if (!ttsLang || ttsLang === 'auto') ttsLang = 'en';
    else if (ttsLang === 'zh-CN') ttsLang = 'zh-CN';
    else if (ttsLang === 'zh-TW') ttsLang = 'zh-TW';
    else if (ttsLang.includes('-')) ttsLang = ttsLang.split('-')[0];

    // Fetch base64 audio parts from google-tts-api
    const audioParts = await googleTTS.getAllAudioBase64(synthesisText, {
      lang: ttsLang,
      slow: slowMode,
      host: 'https://translate.google.com',
      timeout: 15000,
    });

    if (!audioParts || audioParts.length === 0) {
      return res.status(500).json({ success: false, error: 'Could not generate speech audio.' });
    }

    // Combine all MP3 chunks into a single binary buffer
    const buffers = audioParts.map(part => Buffer.from(part.base64, 'base64'));
    const combinedBuffer = Buffer.concat(buffers);

    if (returnFormat === 'mp3') {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="translated-audio.mp3"',
        'Content-Length': combinedBuffer.length,
        'Cache-Control': 'no-cache',
      });
      return res.send(combinedBuffer);
    }

    // Return JSON with base64 data URI for instant client playback & download
    const base64DataUri = `data:audio/mp3;base64,${combinedBuffer.toString('base64')}`;

    res.json({
      success: true,
      audioUrl: base64DataUri,
      fileSize: combinedBuffer.length,
      mimeType: 'audio/mp3',
      lang: ttsLang,
    });
  } catch (err) {
    console.error('Synthesis error:', err);
    res.status(500).json({
      success: false,
      error: 'Audio synthesis failed: ' + (err.message || 'Unknown error'),
    });
  }
});

/**
 * GET /api/download-audio - Direct download GET endpoint with query params
 */
app.get('/api/download-audio', async (req, res) => {
  try {
    const { text, lang = 'en', speed = '1.0' } = req.query;
    if (!text || !text.trim()) {
      return res.status(400).send('Text parameter is required.');
    }

    const synthesisText = text.trim().substring(0, 4000);
    const slowMode = parseFloat(speed) < 0.85;

    let ttsLang = lang;
    if (!ttsLang || ttsLang === 'auto') ttsLang = 'en';
    else if (ttsLang === 'zh-CN') ttsLang = 'zh-CN';
    else if (ttsLang === 'zh-TW') ttsLang = 'zh-TW';
    else if (ttsLang.includes('-')) ttsLang = ttsLang.split('-')[0];

    const audioParts = await googleTTS.getAllAudioBase64(synthesisText, {
      lang: ttsLang,
      slow: slowMode,
      host: 'https://translate.google.com',
      timeout: 15000,
    });

    const buffers = audioParts.map(part => Buffer.from(part.base64, 'base64'));
    const combinedBuffer = Buffer.concat(buffers);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="audio-${ttsLang}-${Date.now()}.mp3"`,
      'Content-Length': combinedBuffer.length,
    });
    res.send(combinedBuffer);
  } catch (err) {
    console.error('Download audio error:', err);
    res.status(500).send('Error generating audio: ' + err.message);
  }
});

/**
 * Summarization Engine
 * Extracts key sentences, bullet points, and generates an executive summary
 */
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t',
  'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having',
  'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s',
  'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d',
  'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

function extractKeyTakeaways(text) {
  if (!text || !text.trim()) {
    return { summary: '', keyPoints: [], keywords: [], reduction: '0%' };
  }

  // Split into raw sentences
  const rawSentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const cleanedSentences = rawSentences
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.split(' ').length >= 6); // filter out trivial phrases

  if (cleanedSentences.length <= 3) {
    return {
      summary: text,
      keyPoints: cleanedSentences,
      keywords: [],
      reduction: '0%'
    };
  }

  // Calculate word frequencies
  const wordFreq = {};
  const words = text.toLowerCase().match(/\b[a-zA-Z\u00C0-\u024F]{3,}\b/g) || [];
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  // Sort top keywords
  const sortedKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  // Score sentences
  const sentenceScores = cleanedSentences.map((sentence, idx) => {
    const sWords = sentence.toLowerCase().match(/\b[a-zA-Z\u00C0-\u024F]{3,}\b/g) || [];
    let score = 0;
    for (const w of sWords) {
      if (wordFreq[w]) score += wordFreq[w];
    }
    // Normalize by length to prevent bias towards long sentences
    score = score / Math.max(1, sWords.length);
    // Position bonus for earlier sentences in document or paragraphs
    if (idx < 3) score *= 1.35;
    return { sentence, score, originalIndex: idx };
  });

  // Pick top 4 for summary and top 6 for key takeaways
  const targetSummaryCount = Math.min(4, Math.ceil(cleanedSentences.length * 0.35));
  const targetKeyPointsCount = Math.min(6, Math.ceil(cleanedSentences.length * 0.5));

  const topForSummary = [...sentenceScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, targetSummaryCount)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map(item => item.sentence);

  const topForKeyPoints = [...sentenceScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, targetKeyPointsCount)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map(item => item.sentence);

  const summaryText = topForSummary.join(' ');
  const originalWordCount = words.length;
  const summaryWordCount = summaryText.split(/\s+/).length;
  const reduction = originalWordCount > 0
    ? `${Math.round((1 - summaryWordCount / originalWordCount) * 100)}%`
    : '0%';

  return {
    summary: summaryText,
    keyPoints: topForKeyPoints,
    keywords: sortedKeywords,
    reduction,
    originalWordCount,
    summaryWordCount,
  };
}

/**
 * Format milliseconds to SRT timestamp 00:00:00,000
 */
function toSrtTime(ms) {
  const pad = (num, digits = 2) => String(Math.floor(num)).padStart(digits, '0');
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

/**
 * POST /api/summarize - Generate AI document summary and bullet key takeaways
 */
app.post('/api/summarize', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Document text is required for summary.' });
    }

    const result = extractKeyTakeaways(text);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ success: false, error: 'Failed to summarize document: ' + err.message });
  }
});

/**
 * POST /api/export-srt - Generate timed Subtitle (.SRT) transcript file
 */
app.post('/api/export-srt', (req, res) => {
  try {
    const { text, speed = 1.0 } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).send('Text is required.');
    }

    const rawSentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    const sentences = rawSentences.map(s => s.trim()).filter(Boolean);

    let currentTimeMs = 500;
    const srtBlocks = [];

    sentences.forEach((sentence, idx) => {
      const words = sentence.split(/\s+/).length;
      // Normal speech is ~140 wpm -> ~430ms per word, adjusted by speed
      const durationMs = Math.max(1600, Math.round((words * 430) / Math.max(0.5, speed)));
      const startTime = toSrtTime(currentTimeMs);
      const endTime = toSrtTime(currentTimeMs + durationMs);

      srtBlocks.push(`${idx + 1}\n${startTime} --> ${endTime}\n${sentence}\n`);
      currentTimeMs += durationMs + 300; // 300ms pause between sentences
    });

    const srtContent = srtBlocks.join('\n');
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="transcript.srt"',
    });
    res.send(srtContent);
  } catch (err) {
    console.error('SRT export error:', err);
    res.status(500).send('Error generating SRT: ' + err.message);
  }
});

/**
 * POST /api/export-bilingual - Creates side-by-side or alternating dual language transcript
 */
app.post('/api/export-bilingual', (req, res) => {
  try {
    const { originalText, translatedText, sourceLang = 'Original', targetLang = 'Translation', format = 'txt' } = req.body;
    const origParas = (originalText || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
    const transParas = (translatedText || '').split(/\n+/).map(p => p.trim()).filter(Boolean);

    const maxLen = Math.max(origParas.length, transParas.length);
    const sections = [];

    for (let i = 0; i < maxLen; i++) {
      const o = origParas[i] || '';
      const t = transParas[i] || '';
      sections.push(`[${sourceLang.toUpperCase()}]\n${o}\n\n[${targetLang.toUpperCase()}]\n${t}\n----------------------------------------\n`);
    }

    const output = `========================================================\nVOXLINGO BILINGUAL TRANSCRIPT\nSource: ${sourceLang} | Target: ${targetLang}\nGenerated on: ${new Date().toLocaleString()}\n========================================================\n\n` + sections.join('\n');

    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="bilingual-${Date.now()}.txt"`,
    });
    res.send(output);
  } catch (err) {
    console.error('Bilingual export error:', err);
    res.status(500).send('Error generating bilingual document: ' + err.message);
  }
});

/**
 * GET /api/sample-pdf - Serves the generated sample PDF file
 */
app.get('/api/sample-pdf', (req, res) => {
  const samplePath = path.join(__dirname, 'public', 'sample.pdf');
  if (fs.existsSync(samplePath)) {
    res.sendFile(samplePath);
  } else {
    res.redirect('/sample.pdf');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'PDF to Audio & Language Translator Backend',
    runtime: 'Node.js ' + process.version,
  });
});

// Start Express Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 PDF to Audio & Language Translator Server running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Static Assets: ${path.join(__dirname, 'public')}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
