/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addChatBarButton, ChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { FluxDispatcher, GuildMemberStore, SelectedChannelStore, UserStore } from "@webpack/common";
import { React, useState, useEffect } from "@webpack/common";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

interface ToolState {
    fakeDeafen: boolean;
    fakeMute:   boolean;
    noTyping:   boolean;
    ghostMode:  boolean;
}

// ─────────────────────────────────────────────
//  Plugin Settings
// ─────────────────────────────────────────────

const settings = definePluginSettings({
    showInNavBar: {
        type:        OptionType.BOOLEAN,
        description: "Toolbox-Icon in der Navigationsleiste anzeigen",
        default:     true,
        restartNeeded: false,
    },
    accentColor: {
        type:        OptionType.STRING,
        description: "Akzentfarbe des Panels (Hex, z.B. #5865F2)",
        default:     "#5865F2",
        restartNeeded: false,
    },
});

// ─────────────────────────────────────────────
//  Fake Deafen Logic
// ─────────────────────────────────────────────

function applyFakeDeafen(enabled: boolean) {
    FluxDispatcher.dispatch({
        type:    "AUDIO_SET_SELF_DEAF",
        selfDeaf: enabled,
    });
}

function applyFakeMute(enabled: boolean) {
    FluxDispatcher.dispatch({
        type:      "AUDIO_SET_SELF_MUTE",
        selfMute:  enabled,
    });
}

// ─────────────────────────────────────────────
//  Toolbox Panel Component
// ─────────────────────────────────────────────

function ToolboxPanel({ onClose }: { onClose: () => void }) {
    const accent = settings.store.accentColor || "#5865F2";

    const [tools, setTools] = useState<ToolState>({
        fakeDeafen: false,
        fakeMute:   false,
        noTyping:   false,
        ghostMode:  false,
    });

    const toggle = (key: keyof ToolState) => {
        setTools(prev => {
            const next = { ...prev, [key]: !prev[key] };

            // Side-effects
            if (key === "fakeDeafen") applyFakeDeafen(next.fakeDeafen);
            if (key === "fakeMute")   applyFakeMute(next.fakeMute);

            return next;
        });
    };

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const ToolRow = ({
        label, desc, toolKey, emoji,
    }: { label: string; desc: string; toolKey: keyof ToolState; emoji: string }) => {
        const active = tools[toolKey];
        return (
            <div
                style={{
                    display:       "flex",
                    alignItems:    "center",
                    gap:           "12px",
                    padding:       "10px 14px",
                    borderRadius:  "8px",
                    background:    active ? `${accent}22` : "rgba(255,255,255,0.03)",
                    border:        `1px solid ${active ? accent : "rgba(255,255,255,0.06)"}`,
                    cursor:        "pointer",
                    transition:    "all .18s ease",
                    marginBottom:  "6px",
                    userSelect:    "none",
                }}
                onClick={() => toggle(toolKey)}
            >
                <span style={{ fontSize: "22px", lineHeight: 1 }}>{emoji}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{label}</div>
                    <div style={{ color: "#9b9ea7", fontSize: "11px", marginTop: "2px" }}>{desc}</div>
                </div>
                {/* Toggle pill */}
                <div
                    style={{
                        width:        "40px",
                        height:       "22px",
                        borderRadius: "11px",
                        background:   active ? accent : "rgba(255,255,255,0.12)",
                        position:     "relative",
                        transition:   "background .18s ease",
                        flexShrink:   0,
                    }}
                >
                    <div
                        style={{
                            position:     "absolute",
                            top:          "3px",
                            left:         active ? "21px" : "3px",
                            width:        "16px",
                            height:       "16px",
                            borderRadius: "50%",
                            background:   "#fff",
                            transition:   "left .18s ease",
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position:   "fixed",
                    inset:      0,
                    zIndex:     9998,
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(2px)",
                }}
            />

            {/* Panel */}
            <div
                style={{
                    position:     "fixed",
                    top:          "60px",
                    right:        "16px",
                    zIndex:       9999,
                    width:        "320px",
                    background:   "#1e1f22",
                    borderRadius: "12px",
                    border:       `1px solid ${accent}55`,
                    boxShadow:    `0 8px 32px rgba(0,0,0,.6), 0 0 0 1px ${accent}22`,
                    overflow:     "hidden",
                    fontFamily:   "'gg sans', 'Noto Sans', sans-serif",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "10px",
                        padding:      "14px 16px",
                        background:   `linear-gradient(135deg, ${accent}33 0%, transparent 100%)`,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <span style={{ fontSize: "20px" }}>🧰</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>Toolbox</span>
                    <div style={{ flex: 1 }} />
                    <button
                        onClick={onClose}
                        style={{
                            background:   "none",
                            border:       "none",
                            color:        "#9b9ea7",
                            cursor:       "pointer",
                            fontSize:     "18px",
                            lineHeight:   1,
                            padding:      "2px 6px",
                            borderRadius: "4px",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Tools */}
                <div style={{ padding: "12px" }}>
                    <div
                        style={{
                            fontSize:     "10px",
                            fontWeight:   700,
                            color:        "#6b6f7a",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                            paddingLeft:  "2px",
                        }}
                    >
                        Voice
                    </div>

                    <ToolRow
                        toolKey="fakeDeafen"
                        emoji="🔇"
                        label="Fake Deafen"
                        desc="Anderen zeigen, dass du taub bist – du hörst trotzdem"
                    />
                    <ToolRow
                        toolKey="fakeMute"
                        emoji="🎙️"
                        label="Fake Mute"
                        desc="Zeige Stumm an, dein Mikro ist aber aktiv"
                    />

                    <div
                        style={{
                            fontSize:     "10px",
                            fontWeight:   700,
                            color:        "#6b6f7a",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            margin:       "12px 0 8px",
                            paddingLeft:  "2px",
                        }}
                    >
                        Chat
                    </div>

                    <ToolRow
                        toolKey="noTyping"
                        emoji="⌨️"
                        label="Typing-Indikator aus"
                        desc="Kein „tippt..." wird anderen angezeigt"
                    />
                    <ToolRow
                        toolKey="ghostMode"
                        emoji="👻"
                        label="Ghost Mode"
                        desc="Keine Lesebestätigungen senden"
                    />
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding:    "10px 16px",
                        borderTop:  "1px solid rgba(255,255,255,0.05)",
                        color:      "#4b4f58",
                        fontSize:   "10px",
                        textAlign:  "center",
                    }}
                >
                    ToolboxPlugin · eigenes Vencord-Plugin
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────
//  Navbar Button (via ChatBar als Platzhalter)
//  → Für echten Navbar-Eintrag: NavBar-Patcher nutzen (siehe unten)
// ─────────────────────────────────────────────

function ToolboxNavButton() {
    const [open, setOpen] = useState(false);
    const accent = settings.store.accentColor || "#5865F2";

    if (!settings.store.showInNavBar) return null;

    return (
        <>
            {/* Icon-Button (oben rechts in Discord via CSS-Injection positioniert) */}
            <button
                id="vencord-toolbox-btn"
                title="Toolbox öffnen"
                onClick={() => setOpen(o => !o)}
                style={{
                    background:   open ? `${accent}33` : "transparent",
                    border:       `1px solid ${open ? accent : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "8px",
                    color:        open ? accent : "#9b9ea7",
                    cursor:       "pointer",
                    fontSize:     "18px",
                    padding:      "4px 8px",
                    lineHeight:   1,
                    transition:   "all .15s ease",
                }}
            >
                🧰
            </button>

            {open && <ToolboxPanel onClose={() => setOpen(false)} />}
        </>
    );
}

// ─────────────────────────────────────────────
//  Plugin Definition
// ─────────────────────────────────────────────

export default definePlugin({
    name:        "ToolboxPlugin",
    description: "Ein aufklappbares Toolbox-Panel mit Fake Deafen, Fake Mute und mehr.",
    authors:     [Devs.Ven], // ← deinen eigenen Eintrag in constants.ts eintragen

    settings,

    // Wir patchen die Toolbar-Area (obere rechte Ecke)
    patches: [
        {
            // Ziel: die rechte Toolbar-Leiste in Discord
            find:        "toolbar:function",
            replacement: {
                match:   /(\w+\.toolbar\s*=\s*function[^)]+\))\s*\{/,
                replace: "$1{",
            },
        },
    ],

    // CSS: positioniert unseren Button in die Navbar
    start() {
        const style = document.createElement("style");
        style.id    = "vencord-toolbox-style";
        style.textContent = `
            /* Toolbox-Button in der rechten Discord-Toolbar */
            #vencord-toolbox-btn {
                margin: 0 4px;
                vertical-align: middle;
            }
        `;
        document.head.appendChild(style);

        // Button in Discord-Toolbar injizieren
        this._injectNavButton();
    },

    stop() {
        document.getElementById("vencord-toolbox-style")?.remove();
        document.getElementById("vencord-toolbox-root")?.remove();
    },

    _injectNavButton() {
        // Warte auf Discord-Toolbar
        const tryInject = () => {
            // Discord's Toolbar-Selektor (kann sich mit Updates ändern)
            const toolbar =
                document.querySelector('[class*="toolbar"]') ??
                document.querySelector('[class*="upperContainer"]');

            if (!toolbar) {
                setTimeout(tryInject, 500);
                return;
            }

            if (document.getElementById("vencord-toolbox-root")) return;

            const root = document.createElement("div");
            root.id    = "vencord-toolbox-root";
            root.style.display = "contents";
            toolbar.prepend(root);

            // React in den div rendern
            const { createRoot } = require("react-dom/client");
            createRoot(root).render(<ToolboxNavButton />);
        };

        tryInject();
    },
});
