import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import config from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Visual metaphor templates for Bhagavad Gita themes
const METAPHOR_LIBRARY = {
  equanimity: ['lotus untouched by muddy water', 'mountain standing through storms', 'still lake reflecting sky'],
  knowledge: ['rising sun dispelling darkness', 'flame illuminating truth', 'open book of wisdom'],
  devotion: ['river flowing to ocean', 'flowers blooming toward light', 'tree rooted in earth, reaching sky'],
  dharma: ['chariot wheel turning with purpose', 'path through forest', 'warrior standing firm'],
  detachment: ['lotus floating free', 'bird in flight unbounded', 'flame burning without consuming'],
  meditation: ['inner light glowing', 'still pond reflecting stars', 'empty vessel awaiting wisdom'],
  renunciation: ['hermit beneath ancient tree', 'wanderer on sacred path', 'seed returning to earth'],
  action: ['warrior on chariot', 'hands in service', 'strength balanced with wisdom'],
  surrender: ['river merging with ocean', 'petals falling open', 'child trusting elder hands'],
  unity: ['many threads in sacred tapestry', 'diverse flowers in one garden', 'branches of one tree'],
};

// Scene diversity rotation
const SCENE_TYPES = [
  'teaching', 'nature', 'reflection', 'journey', 'dharma', 'meditation', 'devotional', 'divine_revelation'
];

// Verse understanding extraction
async function extractVerseUnderstanding(verse, verseKey) {
  // Simple extraction logic - can be enhanced with LLM calls
  const { translation, sanskrit, transliteration } = verse;
  
  return {
    key: verseKey,
    teaching: translation.simple || 'Spiritual teaching',
    emotion: 'Devotional',
    context: translation.deep || '',
    spiritualLesson: translation.essence || '',
    characters: ['Krishna', 'Arjuna'], // Can be enhanced
    symbolism: 'Sacred knowledge',
  };
}

// Generate visual metaphor for verse
function generateVisualMetaphor(understanding, verseNum) {
  // Select metaphor based on verse theme
  const themes = Object.keys(METAPHOR_LIBRARY);
  const themeIndex = verseNum % themes.length;
  const theme = themes[themeIndex];
  const metaphors = METAPHOR_LIBRARY[theme];
  const selectedMetaphor = metaphors[verseNum % metaphors.length];
  
  return {
    theme,
    metaphors: metaphors.slice(0, 2),
    selectedMetaphor,
  };
}

// Create scenario for verse
function createScenario(verseKey, understanding, metaphor, sceneTypeIndex) {
  const sceneType = SCENE_TYPES[sceneTypeIndex % SCENE_TYPES.length];
  
  const scenarios = {
    teaching: `Krishna teaches Arjuna about ${understanding.symbolism} beneath an ancient banyan tree.`,
    nature: `A sacred scene in nature illustrating ${metaphor.selectedMetaphor} with Krishna and Arjuna present.`,
    reflection: `Arjuna sits in contemplation, reflecting on the teaching: ${understanding.spiritualLesson}`,
    journey: `Krishna and Arjuna travel through a sacred landscape, with ${metaphor.selectedMetaphor} appearing naturally.`,
    dharma: `Krishna guides Arjuna to understand duty and dharma through symbolic action.`,
    meditation: `A serene scene of inner stillness and meditation, with ${metaphor.selectedMetaphor} present.`,
    devotional: `Krishna reveals divine wisdom to a reverent Arjuna, surrounded by sacred symbolism.`,
    divine_revelation: `Krishna manifests divine presence as Arjuna witnesses transcendental knowledge.`,
  };

  return {
    verse: verseKey,
    theme: understanding.symbolism,
    metaphor: metaphor.selectedMetaphor,
    sceneType,
    scenario: scenarios[sceneType] || scenarios.teaching,
    characters: understanding.characters,
    emotion: understanding.emotion,
  };
}

// Validate scenario against rules
function validateScenario(scenario) {
  const rejectionReasons = [];

  // Checks for forbidden patterns
  const forbiddenPatterns = [
    /romantic|proposal|wedding|flirtatious|intimate|staring.*eyes|flowers.*directly|courtship/i,
    /superhero|fantasy|hero.*pose|anime|game.*art|generic.*fantasy/i,
    /excessive.*action|excessive.*battle|excessive.*violence|modern.*object/i,
  ];

  const scenarioText = `${scenario.scenario} ${scenario.theme} ${scenario.metaphor}`;
  
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(scenarioText)) {
      rejectionReasons.push(`Contains forbidden pattern: ${pattern}`);
    }
  }

  // Checks for required elements
  const requiredChecks = {
    spiritual: /sacred|divine|spiritual|wisdom|teaching|dharma|devotion|meditation/i.test(scenarioText),
    hasCharacters: scenario.characters && scenario.characters.length > 0,
    appropriateAction: !/intimate|romantic|proposal/i.test(scenarioText),
    devotional: /krishna|arjuna|teaching|guide|reveal|wisdom/i.test(scenarioText),
  };

  const failedChecks = Object.entries(requiredChecks)
    .filter(([, passed]) => !passed)
    .map(([check]) => check);

  return {
    isValid: rejectionReasons.length === 0 && failedChecks.length === 0,
    rejectionReasons,
    failedChecks,
    validationDetails: requiredChecks,
  };
}

// Generate final image prompt
function generateFinalImagePrompt(scenario, verseKey) {
  const styleGuide = `Traditional Rajput and Pahari miniature painting, sacred Hindu storytelling, rich natural pigments, intricate detailing, elegant handcrafted artistry, timeless Bhagavad Gita illustration, authentic Hindu iconography, museum-quality artwork, minimal decorative border, artwork-focused composition, square mobile-first format.`;

  const prompt = `${scenario.scenario}

Metaphor: ${scenario.metaphor}

Theme: ${scenario.theme}

Style: ${styleGuide}

The image should be square, mobile-first composition with the subject occupying 80-90% of the image. 
Minimal border. Single focused scene. This illustrates verse ${verseKey} of the Bhagavad Gita.
The image must be respectful, spiritual, and devotional.`;

  return {
    verseKey,
    imagePrompt: prompt,
    metaphor: scenario.metaphor,
    sceneType: scenario.sceneType,
    estimatedTokens: prompt.split(' ').length,
    generatedAt: new Date().toISOString(),
  };
}

// Main prompt generation
async function generateAllPrompts() {
  try {
    logger.info('Starting prompt generation...');

    // Read Gita data
    const gitaData = JSON.parse(await fs.readFile(config.gitaDataPath, 'utf-8'));

    const allPrompts = [];
    const allMetadata = [];
    let verseCounter = 0;

    // Process chapters
    logger.info(`Processing ${gitaData.chapters.length} chapters...`);
    for (let i = 0; i < gitaData.chapters.length; i++) {
      const chapter = gitaData.chapters[i];
      
      // Generate chapter banner prompt
      const chapterPrompt = {
        type: 'chapter_banner',
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        imagePrompt: `A grand Rajput miniature painting style banner for "${chapter.title}" (Chapter ${chapter.chapter_number}) of the Bhagavad Gita. 
The image should depict the essence of this chapter: ${chapter.summary}.
Traditional Rajput and Pahari miniature painting style. Rich natural pigments, intricate detailing.
Authentic Hindu iconography. Museum-quality artwork. Square mobile-first format.
Subject occupies 90% of image with minimal decorative border.`,
        metaphor: chapter.title,
        sceneType: 'divine_revelation',
        generatedAt: new Date().toISOString(),
      };
      
      allPrompts.push(chapterPrompt);
      allMetadata.push({
        id: `ch-${chapter.chapter_number}`,
        type: 'chapter_banner',
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        r2Path: `gita/chapters/${chapter.chapter_number}/banner.jpg`,
        status: 'pending',
      });
    }

    // Process verses
    logger.info(`Processing ${Object.keys(gitaData.verses).length} verses...`);
    for (const [verseKey, verse] of Object.entries(gitaData.verses)) {
      verseCounter++;

      if (verseCounter % 100 === 0) {
        logger.info(`Processed ${verseCounter} verses...`);
      }

      try {
        // Step 1: Understand verse
        const understanding = await extractVerseUnderstanding(verse, verseKey);

        // Step 2: Generate visual metaphor
        const metaphor = generateVisualMetaphor(understanding, verseCounter);

        // Step 3: Create scenario
        const scenario = createScenario(verseKey, understanding, metaphor, verseCounter);

        // Step 4: Validate scenario
        let finalScenario = scenario;
        const validation = validateScenario(scenario);

        if (!validation.isValid) {
          logger.warn(`Verse ${verseKey} failed validation, attempting retry...`);
          // Regenerate with different scene type
          const retryScenario = createScenario(verseKey, understanding, metaphor, verseCounter + 1);
          const retryValidation = validateScenario(retryScenario);
          
          if (!retryValidation.isValid) {
            logger.error(`Verse ${verseKey} failed retry validation`, retryValidation);
            continue;
          }
          finalScenario = retryScenario;
          logger.info(`✓ Verse ${verseKey} passed on retry`);
        }

        // Step 5: Generate final image prompt
        const finalPrompt = generateFinalImagePrompt(finalScenario, verseKey);

        allPrompts.push(finalPrompt);

        // Track metadata
        const [chapter, verseNum] = verseKey.split('-').map(Number);
        allMetadata.push({
          id: verseKey,
          type: 'verse_image',
          chapter,
          verse: verseNum,
          title: verse.title || `Verse ${verseKey}`,
          metaphor: metaphor.selectedMetaphor,
          sceneType: scenario.sceneType,
          r2Path: `gita/chapters/${chapter}/verses/${verseNum}/image.jpg`,
          promptTokens: finalPrompt.estimatedTokens,
          status: 'pending',
          generatedAt: finalPrompt.generatedAt,
        });

      } catch (err) {
        logger.error(`Error processing verse ${verseKey}:`, err.message);
      }
    }

    // Ensure output directories exist
    const dataDir = path.join(__dirname, '..', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Write prompts
    const promptsPath = path.join(dataDir, 'prompts.json');
    await fs.writeFile(promptsPath, JSON.stringify(allPrompts, null, 2));
    logger.info(`✓ Generated ${allPrompts.length} prompts saved to ${promptsPath}`);

    // Write metadata
    const metadataPath = path.join(dataDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(allMetadata, null, 2));
    logger.info(`✓ Generated ${allMetadata.length} metadata entries saved to ${metadataPath}`);

    logger.info('Prompt generation completed successfully!');
    return { prompts: allPrompts, metadata: allMetadata };

  } catch (error) {
    logger.error('Error during prompt generation:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllPrompts().catch(err => {
    logger.error('Fatal error:', err);
    process.exit(1);
  });
}

export { generateAllPrompts, generateFinalImagePrompt, validateScenario, createScenario };
