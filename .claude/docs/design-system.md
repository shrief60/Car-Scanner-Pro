# Qar design system

Extracted from the shipped screens (`welcome`, `login`, `register`, `home`, `add-car`,
`scan/[id]`). **Every new screen must match this.** The values below are what the code
actually uses — not aspirations.

Two rules that override everything else:

1. **Dark olive-green, always.** `app.json` sets `"userInterfaceStyle": "dark"`. There is
   no light mode. Never write a light background.
2. **Copy an existing screen's scaffold rather than inventing one.** `login.tsx` is the
   reference for a form screen, `home.tsx` for a content screen.

---

## 1. Colour

`constants/colors.ts` exists but **only `app/+not-found.tsx` uses `useColors()`** —
every other screen hardcodes hex. Match the existing screens; don't refactor the whole
app to the hook as a side quest.

| Token | Hex | Used for | Uses |
| --- | --- | --- | --- |
| **Background** | `#082926` | screen background, deepest layer, text on white buttons | 48 |
| **Gradient mid** | `#16433B` | the middle stop of the screen gradient | 6 |
| **Surface / card** | `#0e3b33` | cards, tiles, list rows | 13 |
| **Border** | `#1a5048` | every card and input border | 25 |
| **Text** | `#FFFFFF` | headings, body, primary button fill | 76 |
| **Muted text** | `#7fb5ae` | labels, subtitles, captions, placeholders | 58 |
| **Muted on white** | `#4a8a82` | secondary text *inside white cards* | 20 |
| **Destructive** | `#ef4444` | errors | 21 |

> `#4a8a82` is **not** in `constants/colors.ts`. It is nonetheless the established
> muted tone for text sitting on a white surface. Use it there; use `#7fb5ae` everywhere else.

Translucent overlays — prefer these over new solid colours:

```
rgba(255,255,255,0.08)   circular icon buttons (back, header actions)
rgba(255,255,255,0.07)   input field fill
rgba(239,68,68,0.10)     error box fill
rgba(239,68,68,0.25)     error box border
```

### Accent colours — service/category icons only

Never for text, borders, or buttons. The icon glyph takes the accent; its container
takes the same colour at 12–20% opacity.

```
#4ade80 green    #60a5fa blue     #fbbf24 amber
#c084fc purple   #fb923c orange   #f87171 red
```

### The screen gradient

Used on every auth screen and any full-bleed screen:

```tsx
<LinearGradient
  colors={['#082926', '#16433B', '#082926']}
  locations={[0, 0.5, 1]}
  style={{ flex: 1 }}
>
```

`home.tsx` uses a flat `backgroundColor: '#082926'` instead, because its content
scrolls far past a gradient's useful range. **Rule: gradient for a single-viewport
screen, flat `#082926` for a long scrolling one.**

---

## 2. Typography

Only Inter, only these four weights — all loaded in `app/_layout.tsx`. Font family is an
inline string; there is no typography token module.

| Role | Size | Family | Colour |
| --- | --- | --- | --- |
| Screen title | 32 | `Inter_700Bold` | `#FFFFFF` |
| Brand wordmark | 34 | `Inter_700Bold` | `#FFFFFF`, `letterSpacing: 2` |
| Section title | 19 | `Inter_700Bold` | `#FFFFFF` |
| Card / row title | 15–18 | `Inter_600SemiBold` | `#FFFFFF` |
| Button label | 17 | `Inter_700Bold` | `#082926` on white |
| Body / input text | 16 | `Inter_400Regular` | `#FFFFFF` |
| Screen subtitle | 15 | `Inter_400Regular` | `#7fb5ae` |
| Field label | 14 | `Inter_500Medium` | `#7fb5ae` |
| Meta / caption | 12–13 | `Inter_400Regular` | `#7fb5ae` |
| Micro (in white cards) | 10 | `Inter_400Regular` | `#4a8a82` |

Plate numbers are a special case — `letterSpacing: 2` and bold, because they are
rendered in Arabic-Indic digits and need to read as an identifier:

```tsx
carPlate: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 2 }
```

---

## 3. Spacing and shape

| | Value |
| --- | --- |
| Screen horizontal padding | **28** on auth/form screens, **20** on content screens |
| Gap between major blocks | 32 (auth), 18 (content) |
| Gap between form fields | 18 |
| Gap label → input | 8 |
| Gap inside a row (icon → text) | 8–12 |
| Card padding | 14–16 |

Radii — pick from this ladder, don't invent:

| Radius | Applies to |
| --- | --- |
| 10–13 | error boxes, small inner tiles |
| **14** | **inputs and primary buttons — the app's signature radius** |
| 16 | cards and list rows |
| 20 | large feature cards (the "Find a Qar car" panel) |
| pill (`w/2`) | circular icon buttons, FAB |

### Safe area — required on every screen

Copy this exactly. The `Platform.OS === 'web'` offsets are deliberate and appear on
every screen:

```tsx
const insets = useSafeAreaInsets();
// ...
contentContainerStyle={[styles.container, {
  paddingTop:    insets.top    + (Platform.OS === 'web' ? 67 : 16),
  paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40),
}]}
```

---

## 4. Component recipes

### Screen scaffold — form screen

```tsx
<LinearGradient colors={['#082926', '#16433B', '#082926']} locations={[0, 0.5, 1]} style={{ flex: 1 }}>
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: /* … */, paddingBottom: /* … */ }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* back button, header, form, button, switch row */}
    </ScrollView>
  </KeyboardAvoidingView>
</LinearGradient>
```

`container: { flexGrow: 1, paddingHorizontal: 28, gap: 32 }`

### Back button — 44×44 circle, top-left

```tsx
backBtn: {
  width: 44, height: 44, borderRadius: 22,
  backgroundColor: 'rgba(255,255,255,0.08)',
  justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start',
}
```
With `<Ionicons name="arrow-back" size={24} color="#FFFFFF" />`.
Header action buttons on content screens are the same thing at **42×42 / radius 21**.

### Screen header

```tsx
<View style={{ gap: 6 }}>
  <Text style={styles.title}>Sign In</Text>        {/* 32 / Bold / #FFFFFF */}
  <Text style={styles.subtitle}>Welcome back to Qar</Text>  {/* 15 / Regular / #7fb5ae */}
</View>
```

### Text input — label above, icon inside

```tsx
inputWrapper: {
  flexDirection: 'row', alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1, borderColor: '#1a5048', borderRadius: 14, paddingHorizontal: 14,
},
input: { flex: 1, paddingVertical: 16, fontSize: 16, fontFamily: 'Inter_400Regular', color: '#FFFFFF' },
```

Leading `<Ionicons size={20} color="#4a8a82" />` with `marginRight: 8`.
Placeholders use `placeholderTextColor="#4a8a82"`. Password fields get a trailing
eye toggle (`eyeBtn: { padding: 4 }`).

### Primary button — white fill, dark label

```tsx
button:        { backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
buttonText:    { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#082926' },
buttonDisabled:{ opacity: 0.35 },
buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
```

Show `<ActivityIndicator color="#082926" />` in place of the label while pending.

### Card / list row

```tsx
card: {
  backgroundColor: '#0e3b33', borderRadius: 16, padding: 14,
  borderWidth: 1, borderColor: '#1a5048',
  flexDirection: 'row', alignItems: 'center', gap: 12,
}
```

Leading icon container: `46×46, borderRadius 14, backgroundColor '#082926'`.

### Section header

```tsx
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Services</Text>          {/* 19 / Bold */}
  <Text style={styles.sectionCaption}>Everything for your car</Text>  {/* 12 / #7fb5ae */}
</View>
```
`sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }`

### Error box

```tsx
errorBox: {
  flexDirection: 'row', alignItems: 'center', gap: 8,
  backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12,
  borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
},
errorText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ef4444' },
```
Paired with `<Ionicons name="alert-circle" size={16} color="#ef4444" />`.

### Card grid — 2 columns, every card the same size

Fixed half-width cards with `justifyContent: 'space-between'` pushing each row out to
both edges. An odd last card keeps the same width and sits at the left — **cards never
stretch to fill a short row.**

```tsx
grid: {
  flexDirection: 'row', flexWrap: 'wrap',
  rowGap: 10, justifyContent: 'space-between',
},
card: { width: '48.5%', minHeight: 112, /* …card styles… */ },
```

Use `rowGap`, not `gap` — `space-between` supplies the horizontal spacing, so a column
gap would fight it.

Do **not** size grid cards with `flexGrow`, and do not use a percentage that assumes a
column count (`31.9%` for 3-up strands the whole right third — see §8). This recipe is
independent of how many items are in the list.

Icon containers in a grid take the accent colour at `22` alpha suffix
(`backgroundColor: \`${color}22\``) with the glyph in the solid accent.

### Avatar

There is no avatar image field on the API, so the large avatar is **initials on a
gradient** — `initialsOf()` in `(main)/profile.tsx`:

```tsx
avatar:     { width: 64, height: 64, borderRadius: 32,
              borderWidth: 1, borderColor: '#1a5048',
              justifyContent: 'center', alignItems: 'center' },   // LinearGradient
avatarText: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 1 },
```
with `colors={['#1e6b60', '#16433B']}` on the diagonal.

**In the header bar, use an icon, not initials.** A letter on a coloured disc reads as a
foreign element next to the outline icons. The profile button is a plain `headerBtn`
with `person-outline` at 22/`#FFFFFF` — identical to the bell beside it.

### Skeletons — never a spinner for content

`components/Skeleton.tsx` is a pulsing block (`#1a5048`, opacity 0.35 ↔ 0.9 over 750ms).
Compose the shape of what's loading so nothing shifts when data lands:

```tsx
<Skeleton width={38} height={38} radius={12} />          {/* an icon tile */}
<Skeleton width={150} height={15} style={{ marginTop: 6 }} />
```

Rules:
- **Skeleton only what is genuinely pending.** `profile.tsx` paints the name and email
  from the cached session immediately and skeletons just the rows that need the network
  — don't fake a load for data you already hold.
- An `ActivityIndicator` floating in a layout gap is the anti-pattern this replaces.
  Keep spinners for *actions* (a button mid-submit), not for content.

### Info list — label above value, grouped in one card

For read-only detail rows. One card, hairline dividers **inset past the icon** so they
line up with the text:

```tsx
infoCard: { backgroundColor: '#0e3b33', borderRadius: 16, borderWidth: 1,
            borderColor: '#1a5048', paddingHorizontal: 14 },
infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#082926',
            justifyContent: 'center', alignItems: 'center' },
infoLabel:{ fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
infoValue:{ fontSize: 15, fontFamily: 'Inter_500Medium', color: '#FFFFFF', marginTop: 2 },
divider:  { height: 1, backgroundColor: '#1a5048', marginLeft: 50 },
```

### Pill badge

```tsx
badge:     { flexDirection: 'row', alignItems: 'center', gap: 5,
             backgroundColor: 'rgba(255,255,255,0.08)',
             borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
badgeText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#7fb5ae' },
// success variant
badgeOk:     { backgroundColor: 'rgba(74,222,128,0.12)' },
badgeTextOk: { color: '#4ade80' },
```

### Destructive button

Tinted, not filled — reserve the solid white button for the primary action:

```tsx
logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
             backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, paddingVertical: 16,
             borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
logoutText:{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#ef4444' },
```

### List screen — FlatList

The app's list pattern. `components/ServiceMenuScreen.tsx` is the worked example.

```tsx
<FlatList
  data={rows}
  keyExtractor={row => `${row.merchant.id}:${row.id}`}   // composite where ids repeat
  renderItem={({ item }) => <Card item={item} onPress={…} />}
  getItemLayout={(_, i) => ({ length: H + GAP, offset: (H + GAP) * i, index: i })}
  ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
  initialNumToRender={6}
  removeClippedSubviews={false}
  refreshControl={<RefreshControl … />}
  ListEmptyComponent={isPending ? <Skeletons /> : <EmptyState />}
/>
```

- **Cards must be fixed height** — that is what makes `getItemLayout` possible, and it
  is the single biggest scroll win. Clamp every text node with `numberOfLines`.
- **`RefreshControl` needs explicit colours.** The default spinner is dark-on-dark and
  invisible on `#082926`: `tintColor="#7fb5ae"` (iOS), `colors={['#7fb5ae']}` and
  `progressBackgroundColor="#0e3b33"` (Android).
- **`removeClippedSubviews={false}`** — it defaults to `true` on Android and causes
  blank cells; at these list sizes it buys nothing.
- **Never nest a FlatList in a ScrollView** to make a header scroll — that silently
  disables virtualisation. Keep headers and tab bars *outside* the list so they also
  don't remount on tab switch.
- **No `React.memo` / `useCallback` / `useMemo`.** `app.json` enables
  `experiments.reactCompiler`, so hand-memoisation is redundant here.
- Guard `onEndReached` — it fires on mount with empty data:
  `if (hasNextPage && !isFetchingNextPage) fetchNextPage()`.

### Remote images

`components/RemoteImage.tsx`. Data is unreliable — `image_url` can be null and real
storage paths 404 — so the icon placeholder renders *underneath* the image rather than
in an `onError` branch, and a slow or silently-failed load degrades to it.

Inside a virtualised list pass **`recyclingKey`**, or a recycled row briefly shows the
previous item's photo. Also set `cachePolicy="memory-disk"` and `transition={200}`.

### Arabic / RTL content

The legal documents are Arabic inside an otherwise English, left-to-right app.
**Do not call `I18nManager.forceRTL`** — it restarts the app and mirrors every screen.
Lay out the Arabic blocks individually instead (`app/legal/[doc].tsx`):

```tsx
const rtl = { textAlign: 'right', writingDirection: 'rtl' } as const;
// bullets: the marker belongs on the right
bulletRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
```

Arabic needs more vertical room than Latin — use `lineHeight` ~1.8× the font size
(15pt text → 27pt line height), or diacritics and descenders collide.

**Short Arabic labels inside an LTR row stay left-aligned.** Forcing `textAlign:'right'`
on the label of a list row splits it — Arabic hard right, English sub-label hard left,
gap in the middle. The glyphs still shape and read RTL within themselves.

### FAB

```tsx
fab: {
  position: 'absolute', right: 24, width: 58, height: 58, borderRadius: 29,
  backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
},
fabPressed: { transform: [{ scale: 0.94 }] },
```

### Bottom link row

```tsx
<View style={styles.switchRow}>
  <Text style={styles.switchText}>Don't have an account? </Text>
  <Text style={styles.switchLink}>Create one</Text>   {/* 14 / SemiBold / #FFF / underline */}
</View>
```

---

## 5. Forms

Auth forms use **react-hook-form + yup**. Schemas live in `lib/schemas.ts`, the shared
input is `components/FormField.tsx`, and 422 routing is `lib/serverErrors.ts`.
`(auth)/login.tsx` and `(auth)/register.tsx` are the two worked examples.

```tsx
const { control, handleSubmit, setError, formState: { errors, isValid, isSubmitting } } =
  useForm<RegisterValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onTouched',          // not 'onChange' — the phone errors mid-typing
    defaultValues: { name: '', email: '', phone: '', password: '', confirm: '' },
  });

<Controller control={control} name="email" render={({ field, fieldState }) => (
  <FormField
    label="Email" placeholder="your@email.com" icon="mail-outline"
    value={field.value} onChange={field.onChange} onBlur={field.onBlur}
    error={fieldState.error?.message}
    returnKeyType="next" onSubmit={() => phoneRef.current?.focus()}
  />
)} />
```

Bind the button to `isValid` / `isSubmitting`, never to hand-rolled `canSubmit` and
`loading` state.

**Never define a component inside a screen's function body.** This is the sharpest trap
in the codebase — it cost `register.tsx` a working keyboard:

```tsx
export default function RegisterScreen() {
  const Field = (props) => (<TextInput … />);   // ❌ new identity every render
```

Each keystroke sets state → the screen re-renders → `Field` is a *different* function →
React unmounts and remounts the `TextInput` → **focus is lost after one character.**
`FormField` is at module scope for exactly this reason.

**RHF does not manage focus.** `FormField` is a `forwardRef`, so keep a `useRef` per
field and chain them with `returnKeyType="next"` +
`onSubmit={() => nextRef.current?.focus()}`. The last field takes `"done"` and
`handleSubmit(onSubmit)`.

Every field should also carry `autoCapitalize` (`"words"` for names, `"none"` for email
and passwords — the default is wrong for one of them) and `autoComplete` +
`textContentType` (`name` / `emailAddress` / `newPassword` / `current-password`) so iOS
and Android offer autofill.

**Route 422s back to their fields** with `applyServerErrors(err, setError, FIELDS)`.
Laravel returns `{ message, errors: { field: [msg] } }`, where `message` is only the
first problem plus "(and 2 more errors)". Each key lands on its own field; anything
unrecognised (`credentials`, say) goes to `root` and renders in the general error box.
The API's `password_confirmation` is aliased to the form's `confirm`.

**Client rules must match the server's.** `register.tsx` once allowed 6-character
passwords while the API required 8, so every short submit round-tripped to a 422. Rules
that are duplicated live in the schema with a constant (`MIN_PASSWORD`) citing the
endpoint.

**Transform on submit, not in the field.** The phone input holds national digits and the
`+20` chip is presentational; `toE164()` converts at the submit boundary.

## 6. Interaction

- **Every** tappable is a `Pressable` with a pressed style — never a bare `TouchableOpacity`.
- Standard pressed feedback: `opacity: 0.78–0.85` plus `transform: [{ scale: 0.98 }]`.
  Circular buttons use `opacity: 0.7` alone; the FAB uses `scale: 0.94`.
- Haptics on meaningful actions:
  `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` on success,
  `Haptics.impactAsync(...)` on a primary tap.
- Disabled = `opacity: 0.35` and `disabled` set — never a colour change.
- Async actions swap the label for an `ActivityIndicator`; the button stays the same size.

---

## 7. Checklist for a new screen

1. Route file under `app/(main)/` or `app/(auth)/`, registered in the group's `_layout.tsx`.
2. Gradient wrapper (single-viewport) or `#082926` flat (long scroll).
3. `useSafeAreaInsets()` with the web offsets above.
4. 44×44 back button top-left if it is a pushed screen.
5. Title 32/Bold + subtitle 15/`#7fb5ae`.
6. Horizontal padding 28 (form) or 20 (content).
7. Cards `#0e3b33` + `1px #1a5048` + radius 16.
8. Primary action = white button, radius 14, `#082926` bold label.
9. Loading and error states — skeletons for content (§4), the form rules in §5, the error box recipe for
   failures, never a bare `Alert`.
10. Every `Pressable` has a pressed style.
11. `showsVerticalScrollIndicator={false}` and `keyboardShouldPersistTaps="handled"`
    on any `ScrollView`.

---

## 8. Known deviations — fix these, don't copy them

**Never pick a grid width that assumes a column count.** The Services grid used to be
`width: '31.9%'` with `gap: 10` — a 3-column intent that overflowed on every device
(by 2.8pt on iPhone 17 Pro Max, 4.8pt on iPhone 15, 4.0pt on Pixel 10), so the third
card wrapped and the right third of every row rendered empty. Fixed 2026-08-31 with the
2-column `space-between` recipe in §4. Use that pattern for any new grid.

**Other things not to imitate:**

- `useColors()` is dead in practice — the palette assigns the same object to `light` and
  `dark`. Hardcoding hex matches the codebase; just take the values from §1.
- `qr-display.tsx` uses `Alert.alert('… coming in the next update')` for Download and
  Share. Placeholder alerts are not a design pattern — build the real thing or omit
  the control.
- `search-car.tsx` has a styled button with **no `onPress` at all**. If a control cannot
  work yet, disable it visibly (`opacity: 0.35`) rather than leaving it inert.
- There are no spacing/typography token modules. Until there are, take values from the
  tables above so the drift doesn't get worse.
