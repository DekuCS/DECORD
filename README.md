# 🧰 ToolboxPlugin für Vencord

Ein anpassbares Panel in der Discord-Navigationsleiste mit nützlichen Cheats & Tools.

---

## Features

| Tool | Beschreibung |
|------|-------------|
| 🔇 **Fake Deafen** | Zeigt anderen „taub" an – du hörst aber alles |
| 🎙️ **Fake Mute** | Zeigt „stumm" an – Mikro ist trotzdem aktiv |
| ⌨️ **Typing-Indikator aus** | Kein „tippt…" bei anderen anzeigen |
| 👻 **Ghost Mode** | Keine Lesebestätigungen senden |

---

## Installation

1. **Vencord Dev-Setup** benötigt:  
   ```
   git clone https://github.com/Vendicated/Vencord
   cd Vencord && pnpm install
   ```

2. Plugin-Ordner anlegen:
   ```
   src/plugins/ToolboxPlugin/
   ```

3. `index.tsx` aus diesem Repo hineinkopieren.

4. In `src/utils/constants.ts` einen eigenen Dev-Eintrag hinzufügen:
   ```ts
   export const Devs = {
       // ...bestehende Devs...
       DeinName: { name: "DeinName", id: DEINE_USER_ID_n },
   } as const;
   ```
   Danach in `index.tsx` `Devs.Ven` durch `Devs.DeinName` ersetzen.

5. Build & Inject:
   ```
   pnpm build
   pnpm inject
   ```

6. Discord neu starten → Plugin in den Vencord-Einstellungen aktivieren.

---

## Plugin-Einstellungen

| Setting | Beschreibung | Standard |
|---------|-------------|---------|
| `showInNavBar` | Button in Navbar anzeigen | `true` |
| `accentColor` | Panel-Akzentfarbe (Hex) | `#5865F2` |

---

## Eigene Tools hinzufügen

In `index.tsx` einfach einen neuen `ToolRow`-Eintrag im Panel-JSX ergänzen und den State + Side-Effect in der `toggle()`-Funktion behandeln:

```tsx
<ToolRow
    toolKey="meinTool"   // neuen Key in ToolState-Interface eintragen
    emoji="🛠️"
    label="Mein Tool"
    desc="Beschreibung was es macht"
/>
```

Dann in `toggle()`:
```ts
if (key === "meinTool") machenWas(next.meinTool);
```

---

## Hinweis

Fake Deafen / Mute sind clientseitig – der Voice-Server von Discord kann
den tatsächlichen Status trotzdem erkennen. Nutze diese Features auf eigene Verantwortung.
Discord ToS beachten!
