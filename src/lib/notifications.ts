import { LocalNotifications } from "@capacitor/local-notifications";
import { toast } from "sonner";

export interface ReminderConfig {
  enabled: boolean;
  time: string; // e.g. "07:00"
}

// Key for Local Storage
const REMINDER_STORAGE_KEY = "gita_reminder_config";

/**
 * Loads the current reminder configuration from local storage.
 * Default is enabled at 07:00 AM.
 */
export function getReminderConfig(): ReminderConfig {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load reminder config:", e);
  }
  return { enabled: true, time: "07:00" };
}

/**
 * Checks and requests notifications permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== "granted") {
      const request = await LocalNotifications.requestPermissions();
      return request.display === "granted";
    }
    return true;
  } catch (e) {
    console.error("Failed to check/request notifications permissions:", e);
    return false;
  }
}

/**
 * Cancels all scheduled daily reminders.
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    const reminders = pending.notifications.filter((n) => n.id === 1001 || n.id === 1002 || n.id === 1003);
    if (reminders.length > 0) {
      await LocalNotifications.cancel({ notifications: reminders });
      console.log("📅 Cancelled all active scheduled daily reminders.");
    }
  } catch (e) {
    console.error("Failed to cancel daily reminders:", e);
  }
}

// Localized text dictionary for scheduled daily local notifications supporting 12 languages
export const localizedReminders: Record<string, {
  dailyTitle: string;
  dailyBody: string;
  continueTitle: string;
  continueBody: string;
  streakTitle: string;
  streakBody: string;
}> = {
  en: {
    dailyTitle: "Daily Spiritual Reflection 🕉️",
    dailyBody: "Take 2 minutes to read the Bhagavad Gita today.",
    continueTitle: "Continue Reading 📖",
    continueBody: "Continue your journey where you left off at Chapter {verse}.",
    streakTitle: "Maintain Your Streak 🔥",
    streakBody: "Don't lose your streak! Tap to read today's verse."
  },
  hi: {
    dailyTitle: "दैनिक आध्यात्मिक चिंतन 🕉️",
    dailyBody: "आज भगवद्गीता पढ़ने के लिए 2 मिनट निकालें।",
    continueTitle: "पठन जारी रखें 📖",
    continueBody: "अध्याय {verse} से अपना पठन कार्य जारी रखें।",
    streakTitle: "निरंतरता बनाए रखें 🔥",
    streakBody: "अपनी निरंतरता न खोएं! आज का श्लोक पढ़ने के लिए टैप करें।"
  },
  te: {
    dailyTitle: "రోజువారీ ఆధ్యాత్మిక చింతన 🕉️",
    dailyBody: "ఈరోజు భగవద్గీత చదవడానికి 2 నిమిషాలు కేటాయించండి.",
    continueTitle: "పఠనం కొనసాగించండి 📖",
    continueBody: "అధ్యಾಯం {verse} నుండి మీ పఠనాన్ని కొనసాగించండి.",
    streakTitle: "మీ స్ట్రీక్‌ను నిలుపుకోండి 🔥",
    streakBody: "మీ స్ట్రీక్‌ను కోల్పోకండి! ఈరోజు శ్ಲೋకం చదవడానికి నొక్కండి."
  },
  sa: {
    dailyTitle: "दैनिकं चिन्तनम् 🕉️",
    dailyBody: "अद्य भगवद्गीता पठनाय निमेषद्वयं यच्छतु।",
    continueTitle: "पठनम् अनुवर्तताम् 📖",
    continueBody: "अध्याय {verse}तः स्वपठनं अनुवर्तताम्।",
    streakTitle: "नैरन्तरं रक्षतु 🔥",
    streakBody: "नैरन्तर्यं मा त्यजतु! अद्यतनं श्लोकं पठितुं नुदन्तु।"
  },
  ml: {
    dailyTitle: "ദിനചര്യ ധ്യാനം 🕉️",
    dailyBody: "ഇന്ന് ഭഗവദ്ഗീത വായിക്കാൻ 2 മിനിറ്റ് നീക്കിവെക്കൂ.",
    continueTitle: "വായന തുടരുക 📖",
    continueBody: "അദ്ധ്യായം {verse} മുതൽ നിങ്ങളുടെ വായന തുടരുക.",
    streakTitle: "നിങ്ങളുടെ സ്ട്രീക്ക് നിലനിർത്തുക 🔥",
    streakBody: "നിങ്ങളുടെ സ്ട്രീക്ക് നഷ്ടപ്പെടുത്തരുത്! ഇന്നത്തെ ശ്ലോകം വായിക്കാൻ അമർത്തുക."
  },
  kn: {
    dailyTitle: "ದೈನಂದಿನ ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ 🕉️",
    dailyBody: "ಇಂದು ಭಗವದ್ಗೀತೆ ಓದಲು 2 ನಿಮಿಷ ಸಮಯ ನೀಡಿ.",
    continueTitle: "ಓದುವುದನ್ನು ಮುಂದುವರಿಸಿ 📖",
    continueBody: "ಅಧ್ಯಾಯ {verse} ರಿಂದ ನಿಮ್ಮ ಓದನ್ನು ಮುಂದುವರಿಸಿ.",
    streakTitle: "ನಿಮ್ಮ ಸ್ಟ್ರೀಕ್ ಉಳಿಸಿಕೊಳ್ಳಿ 🔥",
    streakBody: "ನಿಮ್ಮ ಸ್ಟ್ರೀಕ್ ಕಳೆದುಕೊಳ್ಳಬೇಡಿ! ಇಂದಿನ ಶ್ಲೋಕ ಓದಲು ಇಲ್ಲಿ ಒತ್ತಿ."
  },
  bn: {
    dailyTitle: "দৈনিক আধ্যাত্মিক চিন্তন 🕉️",
    dailyBody: "আজ ভগবদ গীতা পড়ার জন্য ২ মিনিট সময় দিন।",
    continueTitle: "পড়া চালিয়ে যান 📖",
    continueBody: "অধ্যায় {verse} থেকে আপনার পড়া চালিয়ে যান।",
    streakTitle: "আপনার স্ট্রিক আপনার 🔥",
    streakBody: "আপনার স্ট্রিক হারাবেন না! আজকের শ্লোকটি পড়ার জন্য এখানে ক্লিক করুন।"
  },
  gu: {
    dailyTitle: "દૈનિક આધ્યાત્મિક ચિંતન 🕉️",
    dailyBody: "આજે ભગવદ ગીતા વાંચવા માટે ૨ મિનિટ ફાળવો.",
    continueTitle: "પઠન ચાલુ રાખો 📖",
    continueBody: "અધ્યાય {verse} થી તમારું પઠન ચાલુ રાખો.",
    streakTitle: "તમારી સાતત્ય જાળવી રાખો 🔥",
    streakBody: "તમારી સાતત્ય ગુમાવશો નહીં! આજનો શ્લોક વાંચવા માટે અહીં ટેપ કરો."
  },
  mr: {
    dailyTitle: "दैनिक आध्यात्मिक चिंतन 🕉️",
    dailyBody: "आज भगवद गीता वाचण्यासाठी २ मिनिटे काढा.",
    continueTitle: "वाचन सुरू ठेवा 📖",
    continueBody: "अध्याय {verse} पासून आपले वाचन सुरू ठेवा.",
    streakTitle: "तुमचे सातत्य राखा 🔥",
    streakBody: "तुमचे सातत्य गमावू नका! आजचा श्लोक वाचण्यासाठी येथे क्लिक करा."
  },
  pa: {
    dailyTitle: "ਰੋਜ਼ਾਨਾ ਅਧਿਆਤਮਕ ਚਿੰਤਨ 🕉️",
    dailyBody: "ਅੱਜ ਭਗਵਦ ਗੀਤਾ ਪੜ੍ਹਨ ਲਈ 2 ਮਿੰਟ ਕੱਢੋ।",
    continueTitle: "ਪੜ੍ਹਨਾ ਜਾਰੀ ਰੱਖੋ 📖",
    continueBody: "ਅਧਿਆਇ {verse} ਤੋਂ ਆਪਣੀ ਪੜ੍ਹਾਈ ਜਾਰੀ ਰੱਖੋ।",
    streakTitle: "ਆਪਣੀ ਲਗਾਤਾਰਤਾ ਬਣਾਈ ਰੱਖੋ 🔥",
    streakBody: "ਆਪਣੀ ਲਗਾਤਾਰਤਾ ਨਾ ਗੁਆਓ! ਅੱਜ ਦਾ ਸ਼ਲੋਕ ਪੜ੍ਹਨ ਲਈ ਇੱਥੇ ਟੈਪ ਕਰੋ।"
  },
  ta: {
    dailyTitle: "தினசரி ஆன்மீக சிந்தனை 🕉️",
    dailyBody: "இன்று பகவத் கீதை படிக்க 2 நிமிடங்கள் ஒதுக்குங்கள்.",
    continueTitle: "வாசிப்பைத் தொடரவும் 📖",
    continueBody: "அத்தியாயம் {verse} இலிருந்து உங்கள் வாசிப்பைத் தொடரவும்.",
    streakTitle: "உங்கள் தொடர்ச்சியைத் தக்கவைக்கவும் 🔥",
    streakBody: "உங்கள் தொடர்ச்சியை இழக்காதீர்கள்! இன்றைய வசனத்தைப் படிக்க இங்கே தட்டவும்."
  },
  ne: {
    dailyTitle: "दैनिक आध्यात्मिक चिन्तन 🕉️",
    dailyBody: "आज भगवद गीता पढ्न २ मिनेट समय निकाल्नुहोस्।",
    continueTitle: "पठन जारी राख्नुहोस् 📖",
    continueBody: "अध्याय {verse} बाट आफ्नो पठन जारी राख्नुहोस्।",
    streakTitle: "आफ्नो निरन्तरता कायम राख्नुहोस् 🔥",
    streakBody: "आफ्नो निरन्तरता नगुमाउनुहोस्! आजको श्लोक पढ्न यहाँ ट्याप गर्नुहोस्।"
  }
};

const getNotificationTexts = (lang: string, lastRead: string) => {
  const dict = localizedReminders[lang] || localizedReminders["en"];
  return {
    dailyTitle: dict.dailyTitle,
    dailyBody: dict.dailyBody,
    continueTitle: dict.continueTitle,
    continueBody: dict.continueBody.replace("{verse}", lastRead),
    streakTitle: dict.streakTitle,
    streakBody: dict.streakBody
  };
};

/**
 * Schedules dynamic, multi-type daily reminders to read the Gita in the user's localized language.
 * @param timeString String in "HH:MM" format (24-hour)
 */
export async function scheduleDailyReminder(timeString: string): Promise<boolean> {
  try {
    // 1. Cancel previous notifications to prevent duplicates
    await cancelDailyReminder();

    // 2. Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("⚠️ Notification permissions not granted. Skipping scheduling.");
      return false;
    }

    // 3. Parse hours and minutes
    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.error(`Invalid time string provided for reminder: ${timeString}`);
      return false;
    }

    // 4. Fetch selected app language & last read chapter/verse
    const lang = localStorage.getItem("gita_language") || "en";
    
    const historyRaw = localStorage.getItem("gita_history");
    let lastReadStr = "1.1";
    if (historyRaw) {
      try {
        const history = JSON.parse(historyRaw);
        if (history.length > 0 && history[0].chapter && history[0].verse) {
          lastReadStr = `${history[0].chapter}.${history[0].verse}`;
        }
      } catch {}
    }

    const texts = getNotificationTexts(lang, lastReadStr);

    // 5. Schedule dynamic daily triggers
    await LocalNotifications.schedule({
      notifications: [
        // Daily Reminder (fires at user target time)
        {
          id: 1001,
          title: texts.dailyTitle,
          body: texts.dailyBody,
          schedule: {
            on: {
              hour: hours,
              minute: minutes,
            },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: "default",
          extra: {
            path: "/notifications",
          },
        },
        // Continue Reading Reminder (fires 2 hours after daily reminder)
        {
          id: 1002,
          title: texts.continueTitle,
          body: texts.continueBody,
          schedule: {
            on: {
              hour: (hours + 2) % 24,
              minute: minutes,
            },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: "default",
          extra: {
            path: `/verse/${lastReadStr}`,
          },
        },
        // Streak Reminder Nudge (fires 6 hours after daily reminder)
        {
          id: 1003,
          title: texts.streakTitle,
          body: texts.streakBody,
          schedule: {
            on: {
              hour: (hours + 6) % 24,
              minute: minutes,
            },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: "default",
          extra: {
            path: "/journey",
          },
        },
      ],
    });

    console.log(`📅 Scheduled Daily (0h), Continue (2h), and Streak (6h) reminders in lang: ${lang}.`);
    return true;
  } catch (e) {
    console.error("Failed to schedule daily reminders:", e);
    return false;
  }
}

/**
 * Saves and applies new reminder settings.
 */
export async function updateReminderSettings(enabled: boolean, time: string): Promise<void> {
  const config: ReminderConfig = { enabled, time };
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(config));

  if (enabled) {
    const success = await scheduleDailyReminder(time);
    if (success) {
      toast.success(`Reminder set for ${formatTime12Hour(time)} daily!`);
    } else {
      toast.error("Failed to schedule reminders. Please check your notification settings.");
    }
  } else {
    await cancelDailyReminder();
    toast.info("Daily reminders disabled");
  }
}

/**
 * Helper to convert "HH:MM" string to a nice "HH:MM AM/PM" string.
 */
export function formatTime12Hour(timeString: string): string {
  const [hourStr, minStr] = timeString.split(":");
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return timeString;

  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${displayHours}:${displayMinutes} ${ampm}`;
}
