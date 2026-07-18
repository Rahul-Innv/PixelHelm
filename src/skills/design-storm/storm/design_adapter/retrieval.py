"""
design_adapter/retrieval.py — the DESIGN RetrievalAdapter (Part 2 grounding: search -> fetch -> trust).

Grounds the conversation in a LOCAL corpus of design authority: the design KB
(~/.claude/design/INDEX.md + LESSONS.md + topic docs), the project's design-system docs, a WCAG/AA
reference, and reference-UI / north-star notes. Local files (not the web) are the citeable evidence, so
confidential design research needs no network — the same firewall the engine assumes.

silence != absence (locked): fetch() returns None when a file is missing/unreadable/empty — never a
false zero. trust() ranks by authoritativeness of the channel (a standard outranks a north-star note).
Deterministic: keyword scoring is pure (sorted, no RNG), so the same query yields the same refs.
"""
from __future__ import annotations

import hashlib
import os
import re

from storm_engine.contracts import Source, SourceRef

# authoritativeness by channel (0..1). A standard is the strongest citeable basis; a reference UI the weakest.
_TRUST = {
    "standard": 0.98,   # WCAG / APCA / platform HIG — the specification
    "kb": 0.9,          # the owner's verified design knowledge base (INDEX/LESSONS/topic docs)
    "design_system": 0.9,  # the project's own tokens / DESIGN.md / component contracts
    "reference": 0.6,   # north-star / reference-UI notes (inspiration, not specification)
    "web": 0.5,
}

# which channel each perspective prefers to hear from first (light per-perspective ranking).
_PREFERRED = {
    "accessibility": ("standard", "kb"),
    "visual_brand": ("design_system", "reference"),
    "information_architecture": ("kb", "reference"),
    "conversion_ux": ("kb", "reference"),
    "responsive": ("standard", "design_system"),
    "performance": ("standard", "kb"),
    "basic_fact": ("design_system", "kb"),
    "refuter": ("standard", "kb"),
}

_WORD = re.compile(r"[a-z0-9]+")


def _terms(s: str) -> set:
    return set(_WORD.findall((s or "").lower()))


def _default_read(path: str) -> "str | None":
    try:
        with open(path, "r", encoding="utf-8") as fh:
            txt = fh.read()
    except OSError:
        return None
    return txt or None  # empty file == absent


class DesignRetrieval:
    """RetrievalAdapter over a curated LOCAL design corpus.

    corpus = [{"url": <path>, "channel": <channel>, "title": <str>, "tags": <str>}, ...].
    `read` is injectable (offline tests pass a dict-backed reader); defaults to reading the file.
    `cap` truncates fetched text so a huge doc doesn't blow the expert's context.
    """

    def __init__(self, corpus: list, *, read=None, trust_by_channel=None, cap: int = 6000):
        self.corpus = list(corpus or [])
        self.read = read or _default_read
        self.trust_by_channel = dict(_TRUST, **(trust_by_channel or {}))
        self.cap = cap
        self._cache: dict = {}

    def _relevance(self, item: dict, qterms: set, perspective_id: str) -> tuple:
        text = " ".join(str(item.get(k, "")) for k in ("title", "tags", "channel", "url"))
        overlap = len(qterms & _terms(text))
        prefs = _PREFERRED.get(perspective_id, ())
        pref_rank = prefs.index(item.get("channel")) if item.get("channel") in prefs else len(prefs)
        # sort key: most query-overlap first, then preferred channel, then higher trust, then stable url
        return (-overlap, pref_rank, -self.trust_by_channel.get(item.get("channel"), 0.0), item.get("url", ""))

    def search(self, query: str, *, k: int, perspective_id: str) -> list:
        qterms = _terms(query)
        ranked = sorted(self.corpus, key=lambda it: self._relevance(it, qterms, perspective_id))
        seen, refs = set(), []
        for it in ranked:
            url = it.get("url")
            if not url or url in seen:
                continue
            seen.add(url)
            refs.append(SourceRef(url=url, title=it.get("title"), snippet=it.get("tags"),
                                  channel=it.get("channel")))
            if len(refs) >= k:
                break
        return refs

    def fetch(self, ref: SourceRef):
        if ref.url in self._cache:
            return self._cache[ref.url]
        src = None
        text = self.read(ref.url)
        if text:
            text = text[: self.cap]
            src = Source(url=ref.url, title=ref.title or ref.channel, text=text, as_of=None,
                         channel=ref.channel,
                         content_hash="sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()[:16])
        self._cache[ref.url] = src  # cache the None too (silence != absence, but don't re-probe this run)
        return src

    def trust(self, src: Source) -> float:
        return self.trust_by_channel.get(src.channel, 0.5)

    # -- convenience: build the corpus from the owner's design KB (+ optional project docs) -----------
    @classmethod
    def default_design_kb(cls, *, kb_dir=None, extra=None, read=None):
        """Corpus = the design KB (INDEX/LESSONS/topic docs) + any extra project design-system/reference
        docs passed as [{"url","channel","title","tags"}]. Missing KB files are simply skipped at fetch
        (silence != absence)."""
        kb = kb_dir or os.path.join(os.path.expanduser("~"), ".claude", "design")
        j = os.path.join
        corpus = [
            {"url": j(kb, "INDEX.md"), "channel": "kb", "title": "Design KB index",
             "tags": "routing tokens aa email direction lessons machinery"},
            {"url": j(kb, "LESSONS.md"), "channel": "kb", "title": "Design KB lessons",
             "tags": "corrections owner feedback contrast aa fonts spacing states verified"},
            {"url": j(kb, "tokens-and-aa-enforcement.md"), "channel": "standard",
             "title": "Tokens + AA enforcement (WCAG contrast contract)",
             "tags": "wcag contrast aa 4.5 3.0 tokens drift dark light computed accessibility color"},
            {"url": j(kb, "email-client-constraints.md"), "channel": "standard",
             "title": "Email client constraints",
             "tags": "email gmail 600px chips background clipping responsive"},
            {"url": j(kb, "direction-mockup-process.md"), "channel": "kb",
             "title": "Direction / mockup process",
             "tags": "direction mockup render review north-star screenshot data honesty fonts"},
        ]
        corpus.extend(extra or [])
        return cls(corpus, read=read)
