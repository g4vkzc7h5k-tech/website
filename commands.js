"""
Generates website/backend/data/commands.json from the bot's actual
command_meta registry.

Run this any time commands change:

    python website/backend/command_export.py

It imports every cog module directly (not through bot.load_extension,
so no Discord token or connection is needed - command_meta decorators
run at class-definition time, which is import time). This is the
mechanism that keeps the website's docs from ever drifting out of
sync with the real bot: the website reads the same registry the bot's
,help command reads, never a hand-maintained copy.
"""

from __future__ import annotations

import json
import os
import sys

# Make the project root (two levels up from this file) importable.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

COG_MODULES = [
    "cogs.moderation.moderation",
    "cogs.levels.levels",
    "cogs.tickets.tickets",
    "cogs.voicemaster.voicemaster",
    "cogs.welcome.welcome",
    "cogs.utility.utility",
    "cogs.setup.setup_cog",
    "cogs.security.security",
    "cogs.roles.roles",
    "cogs.giveaway.giveaway",
    "cogs.aliases.aliases",
    "cogs.music.music",
]

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "data", "commands.json")


def main() -> None:
    import importlib

    for module_name in COG_MODULES:
        try:
            importlib.import_module(module_name)
        except Exception as exc:  # a cog with a broken import shouldn't kill the whole export
            print(f"WARNING: could not import {module_name}: {exc}", file=sys.stderr)

    from core.command_meta import registry

    commands_payload = [
        {
            "name": meta.name,
            "category": meta.category,
            "description": meta.description,
            "syntax": meta.syntax,
            "examples": meta.examples,
            "permissions": meta.permissions,
            "aliases": meta.aliases,
        }
        for meta in registry.all()
    ]
    commands_payload.sort(key=lambda c: (c["category"], c["name"]))

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(commands_payload, f, indent=2)

    print(f"Exported {len(commands_payload)} commands to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
