import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, Screen } from "@/components/layout";
import { Group, Row } from "@/components/list";
import { Segmented, Stat } from "@/components/misc";
import { Text } from "@/components/text";
import { localeFor, t } from "@/i18n";
import { formatTime12Hour, useReminderConfig } from "@/lib/reminders-config";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, radius, spacing } from "@/theme";

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export function JourneyScreen() {
  const { colors } = useTheme();
  const { profile, readDates, language } = useProgress();
  const loc = localeFor(language);
  const reminder = useReminderConfig();
  const [mode, setMode] = useState<"week" | "month" | "custom">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [month, setMonth] = useState(() => new Date());
  const [range, setRange] = useState<{ start: string | null; end: string | null }>(() => ({
    start: dateKey(addDays(new Date(), -6)),
    end: dateKey(new Date()),
  }));

  const read = new Set(readDates);
  const today = new Date();
  const weekEnd = addDays(today, -weekOffset);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekEnd, i - 6));
  const weekLabel = `${week[0].toLocaleDateString(loc, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(loc, {
    month: "short",
    day: "numeric",
  })}`;

  const customDays = (() => {
    if (!range.start || !range.end) return [];
    const out: Date[] = [];
    let d = new Date(`${range.start}T00:00:00`);
    const end = new Date(`${range.end}T00:00:00`);
    while (d <= end && out.length < 366) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  })();

  const onPickDay = (key: string) => {
    setRange((r) => {
      if (!r.start || r.end) return { start: key, end: null };
      return key < r.start ? { start: key, end: r.start } : { start: r.start, end: key };
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("yourJourney", language) }} />
      <Screen>
        <Column>
          <View style={{ alignItems: "center", gap: spacing.xs, paddingVertical: spacing.xl, borderRadius: radius.xl, borderCurve: "continuous", backgroundColor: colors.flameSoft }}>
            <Icon name="flameFill" size={30} color={colors.flame} />
            <Text style={{ fontFamily: fonts.serifMedium, fontSize: 40, lineHeight: 46, color: colors.ink, fontVariant: ["lining-nums", "tabular-nums"] }}>{profile.streak}</Text>
            <Text variant="overline" tone="flame">
              {t("streak", language)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", paddingVertical: spacing.lg, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
            <Stat value={profile.versesRead} label={t("verses", language)} />
            <Stat value={`${profile.minutes}m`} label={t("readTime", language)} />
            <Stat value={profile.bookmarks} label={t("saved", language)} />
          </View>
        </Column>

        <Column gap={spacing.md}>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "week", label: t("week", language) },
              { value: "month", label: t("month", language) },
              { value: "custom", label: t("custom", language) },
            ]}
          />

          <View style={{ padding: spacing.lg, gap: spacing.lg, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
            {mode === "week" && (
              <>
                <PeriodHeader
                  label={weekLabel}
                  onPrev={() => setWeekOffset((o) => o + 7)}
                  onNext={() => setWeekOffset((o) => Math.max(0, o - 7))}
                  nextDisabled={weekOffset === 0}
                  badge={`${week.filter((d) => read.has(dateKey(d))).length} / 7 ${t("dayActive", language)}`}
                />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {week.map((d) => (
                    <View key={dateKey(d)} style={{ alignItems: "center", gap: spacing.xs, flex: 1 }}>
                      <Text variant="caption" tone="faint">
                        {d.toLocaleDateString(loc, { weekday: "narrow" })}
                      </Text>
                      <DayDot day={d.getDate()} active={read.has(dateKey(d))} />
                    </View>
                  ))}
                </View>
              </>
            )}

            {mode !== "week" && (
              <MonthGrid
                month={month}
                onMonth={setMonth}
                read={read}
                selectable={mode === "custom"}
                range={mode === "custom" ? range : undefined}
                onPick={onPickDay}
                badge={
                  mode === "month"
                    ? (() => {
                        const n = readDates.filter((k) => k.startsWith(dateKey(month).slice(0, 7))).length;
                        return `${n} ${t("sessions", language)}`;
                      })()
                    : `${customDays.filter((d) => read.has(dateKey(d))).length} ${t("dayActive", language)}`
                }
              />
            )}
            {mode === "custom" && (
              <Text variant="caption" tone="soft" center>
                {range.start && range.end
                  ? `${new Date(`${range.start}T00:00:00`).toLocaleDateString(loc)} – ${new Date(`${range.end}T00:00:00`).toLocaleDateString(loc)}`
                  : t("customRangeHint", language)}
              </Text>
            )}
          </View>
        </Column>

        <Column>
          <Group>
            <Row
              icon="bell"
              title={t("dailyReminder", language)}
              subtitle={reminder.enabled ? `${t("everyMorningAt", language)} ${formatTime12Hour(reminder.time)}` : t("disabled", language)}
              onPress={() => router.push("/reminders")}
            />
          </Group>
        </Column>
      </Screen>
    </View>
  );
}

function PeriodHeader({ label, onPrev, onNext, nextDisabled, badge }: { label: string; onPrev: () => void; onNext: () => void; nextDisabled?: boolean; badge: string }) {
  const { colors } = useTheme();
  const { language } = useProgress();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
      <IconButton icon="chevronLeft" label={t("previousPeriod", language)} size={16} onPress={onPrev} />
      <Text variant="callout" style={{ fontFamily: fonts.display, flexShrink: 1 }} numberOfLines={1}>
        {label}
      </Text>
      <IconButton icon="chevronRight" label={t("nextPeriod", language)} size={16} onPress={onNext} disabled={nextDisabled} />
      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.accentSoft }}>
        <Text variant="caption" tone="accent" style={{ fontWeight: "600" }}>
          {badge}
        </Text>
      </View>
    </View>
  );
}

function DayDot({ day, active, muted, selected, edge }: { day: number; active?: boolean; muted?: boolean; selected?: boolean; edge?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: edge ? colors.accent : active ? colors.flame : selected ? colors.accentSoft : "transparent",
      }}
    >
      <Text
        variant="footnote"
        style={{
          fontVariant: ["tabular-nums"],
          fontWeight: active || edge ? "700" : "400",
          color: edge ? colors.onAccent : active ? colors.background : muted ? colors.inkFaint : colors.ink,
          opacity: muted ? 0.5 : 1,
        }}
      >
        {day}
      </Text>
    </View>
  );
}

function MonthGrid({
  month,
  onMonth,
  read,
  selectable,
  range,
  onPick,
  badge,
}: {
  month: Date;
  onMonth: (d: Date) => void;
  read: Set<string>;
  selectable?: boolean;
  range?: { start: string | null; end: string | null };
  onPick: (key: string) => void;
  badge: string;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1).getDay();
  const total = new Date(year, m + 1, 0).getDate();
  const { language } = useProgress();
  const loc = localeFor(language);
  const now = new Date();
  const cells: (Date | null)[] = [...Array.from({ length: first }, () => null), ...Array.from({ length: total }, (_, i) => new Date(year, m, i + 1))];
  const shift = (n: number) => onMonth(new Date(year, m + n, 1));

  return (
    <View style={{ gap: spacing.md }}>
      <PeriodHeader
        label={month.toLocaleDateString(loc, { month: "long", year: "numeric" })}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        nextDisabled={year === now.getFullYear() && m >= now.getMonth()}
        badge={badge}
      />
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: 7 }, (_, i) => new Date(2026, 2, 1 + i)).map((d, i) => (
          <Text key={i} variant="caption" tone="faint" center style={{ flex: 1 }} numberOfLines={1}>
            {d.toLocaleDateString(loc, { weekday: "narrow" })}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: spacing.xs }}>
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={{ width: `${100 / 7}%` }} />;
          const key = dateKey(d);
          const future = d > now;
          const inRange = !!range?.start && !!range?.end && key >= range.start && key <= range.end;
          const edge = key === range?.start || key === range?.end;
          const cell = <DayDot day={d.getDate()} active={read.has(key) && !edge} muted={future} selected={inRange} edge={edge} />;
          return (
            <View key={key} style={{ width: `${100 / 7}%`, alignItems: "center" }}>
              {selectable && !future ? (
                <Pressable accessibilityRole="button" accessibilityLabel={d.toLocaleDateString(loc, { dateStyle: "full" } as Intl.DateTimeFormatOptions)} onPress={() => onPick(key)} hitSlop={2}>
                  {cell}
                </Pressable>
              ) : (
                cell
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
