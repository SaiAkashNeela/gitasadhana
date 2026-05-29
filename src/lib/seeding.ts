import { writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";
import gitaProcessedData from "@/app/gita-processed.json";

export interface SeedingProgress {
  status: "idle" | "running" | "success" | "error";
  message: string;
  percent: number;
}

export async function seedGitaDatabase(onProgress: (p: SeedingProgress) => void) {
  try {
    onProgress({ status: "running", message: "Starting seeding...", percent: 0 });

    const data = gitaProcessedData as any;
    const chapters = data.chapters || [];
    const versesMap = data.verses || {};
    const quotes = data.quotes || {};

    const verses = Object.values(versesMap);

    onProgress({ status: "running", message: "Preparing batches...", percent: 5 });

    // Step 1: Write Chapters in Batch 1
    let batch = writeBatch(db);
    let count = 0;
    const totalDocs = chapters.length + verses.length + Object.keys(quotes).length;
    let docsProcessed = 0;

    onProgress({ status: "running", message: "Writing Chapters...", percent: 10 });
    for (const ch of chapters) {
      const docRef = doc(db, "chapters", ch.chapter_number.toString());
      batch.set(docRef, {
        id: ch.id,
        chapter_number: ch.chapter_number,
        title: ch.title || {},
        summary: ch.summary || {},
        fullSummary: ch.fullSummary || {},
        verseCount: ch.verseCount || 0,
      });
      count++;
      docsProcessed++;

      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    onProgress({
      status: "running",
      message: `Writing Verses (Total: ${verses.length})...`,
      percent: 20,
    });

    for (let i = 0; i < verses.length; i++) {
      const v: any = verses[i];
      const docId = `${v.chapter}_${v.verse}`;
      const docRef = doc(db, "verses", docId);

      batch.set(docRef, {
        id: v.id,
        chapter: v.chapter,
        verse: v.verse,
        sanskrit: v.sanskrit || "",
        transliteration: v.transliteration || "",
        translation: v.translation || {},
        audio: v.audio || {},
      });
      count++;
      docsProcessed++;

      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
        const progressPercent = Math.round(20 + 80 * (docsProcessed / totalDocs));
        onProgress({
          status: "running",
          message: `Ingesting verses: ${docsProcessed}/${totalDocs}...`,
          percent: progressPercent,
        });
      }
    }

    onProgress({ status: "running", message: "Writing wisdom quotes...", percent: 90 });

    // Step 2: Write Quotes by language
    for (const [lang, items] of Object.entries(quotes)) {
      const docRef = doc(db, "quotes", lang);
      batch.set(docRef, { items });
      count++;
      docsProcessed++;

      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    // Commit any remaining writes
    if (count > 0) {
      await batch.commit();
    }

    onProgress({ status: "success", message: "Database seeded successfully!", percent: 100 });
  } catch (error: any) {
    console.error("Seeding failed:", error);
    onProgress({
      status: "error",
      message: `Seeding failed: ${error.message || error}`,
      percent: 100,
    });
  }
}
