#!/usr/bin/env python3
"""Regenerate the endpoint reference in .claude/docs/api/ from the Postman export.

Source of truth: .claude/reference/Qar.postman_collection.json

Only the region between the BEGIN/END markers in each target file is rewritten, so
hand-written prose (the ability model, coverage tables, implementation notes) survives
regeneration. A target file that exists but has no markers is left untouched and
reported as an error rather than clobbered.

    python3 .claude/tools/gen-api-docs.py
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
COLLECTION = ROOT / ".claude/reference/Qar.postman_collection.json"
OUT_DIR = ROOT / ".claude/docs/api"

BEGIN = "<!-- BEGIN GENERATED -->"
END = "<!-- END GENERATED -->"
WARNING = "<!-- Everything between these markers is produced by .claude/tools/gen-api-docs.py. Edit the collection, not this. -->"

# Expected totals. A mismatch means the collection changed shape — fail loudly
# rather than silently emitting a partial reference.
EXPECT_ENDPOINTS = 41
EXPECT_RESPONSES = 52

# Postman folder name -> output file. Several folders share one file.
GROUP_FILE = {
    "OTP": "auth.md",
    "Password": "auth.md",
    "Google": "auth.md",
    "Account (authenticated)": "auth.md",
    "Cars (client)": "cars.md",
    "QR scan (public)": "scan.md",
    "Print requests (client)": "print-requests.md",
    "Packages (public)": "subscriptions.md",
    "Subscriptions (client)": "subscriptions.md",
    "Merchant menu": "merchant-menu.md",
    "Payments (webhook)": "payments.md",
}

FILE_TITLE = {
    "auth.md": "Authentication & account",
    "cars.md": "Cars",
    "scan.md": "QR scan (public)",
    "print-requests.md": "Print requests",
    "subscriptions.md": "Packages & subscriptions",
    "merchant-menu.md": "Merchant menu",
    "payments.md": "Payments",
}

# Laravel error payloads embed a huge stack trace; keep only the useful fields.
TRACE_KEYS = {"trace", "file", "line", "exception"}


def walk(items, group=None):
    """Yield (group_name, endpoint) for every request in the collection tree."""
    for item in items:
        if "item" in item:
            yield from walk(item["item"], group or item.get("name"))
        else:
            yield group, item


def url_of(raw) -> str:
    """The export stores url as either a string or an object. Normalise to a string."""
    if isinstance(raw, str):
        return raw
    if isinstance(raw, dict):
        if raw.get("raw"):
            return raw["raw"]
        host = "".join(raw.get("host", []))
        path = "/".join(raw.get("path", []))
        return f"{host}/{path}"
    return ""


def path_of(url: str) -> str:
    """Strip the {{baseUrl}} prefix and render {{var}} placeholders as {var}."""
    path = re.sub(r"^\{\{baseUrl\}\}", "", url)
    path = re.sub(r"\{\{(\w+)\}\}", r"{\1}", path)
    return path or "/"


def fence(body: str, lang: str = "json") -> str:
    return f"```{lang}\n{body.rstrip()}\n```"


def pretty(body: str) -> tuple[str, bool]:
    """Pretty-print JSON and drop stack traces. Returns (text, was_truncated)."""
    body = (body or "").strip()
    if not body:
        return "", False
    try:
        data = json.loads(body)
    except (ValueError, TypeError):
        return body, False
    truncated = False
    if isinstance(data, dict) and TRACE_KEYS & data.keys():
        data = {k: v for k, v in data.items() if k not in TRACE_KEYS}
        truncated = True
    return json.dumps(data, indent=2, ensure_ascii=False), truncated


def render_body(request: dict) -> list[str]:
    body = request.get("body") or {}
    mode = body.get("mode")
    out: list[str] = []
    if mode == "raw":
        raw = (body.get("raw") or "").strip()
        if raw:
            text, _ = pretty(raw)
            out += ["**Request body**", "", fence(text), ""]
    elif mode == "formdata":
        fields = body.get("formdata") or []
        if fields:
            out += [
                "**Request body** — `multipart/form-data`",
                "",
                "| Field | Type | Example | Notes |",
                "| --- | --- | --- | --- |",
            ]
            for f in fields:
                note = (f.get("description") or "").replace("|", "\\|")
                value = str(f.get("value", "")).replace("|", "\\|")
                out.append(
                    f"| `{f.get('key')}` | {f.get('type', 'text')} | "
                    f"{'`' + value + '`' if value else '—'} | {note or '—'} |"
                )
            out.append("")
    return out


def render_endpoint(item: dict) -> list[str]:
    request = item.get("request") or {}
    method = request.get("method", "GET")
    url = url_of(request.get("url"))
    path = path_of(url)

    out = [f"### {item.get('name')}", "", f"`{method} {path}`", ""]

    desc = (request.get("description") or "").strip()
    if desc:
        out += [desc, ""]

    headers = [h for h in (request.get("header") or []) if h.get("key")]
    if headers:
        joined = ", ".join(f"`{h['key']}: {h.get('value', '')}`" for h in headers)
        out += [f"Headers: {joined}", ""]

    out += render_body(request)

    for resp in item.get("response") or []:
        code = resp.get("code")
        name = resp.get("name") or ""
        label = f"**Response — `{code}`**"
        if name and str(code) not in name:
            label += f" {name}"
        text, truncated = pretty(resp.get("body") or "")
        out.append(label)
        out.append("")
        if text:
            out.append(fence(text))
            if truncated:
                out.append("")
                out.append("_Stack trace omitted._")
        else:
            out.append("_Empty body._")
        out.append("")

    return out


def stub(filename: str) -> str:
    title = FILE_TITLE.get(filename, filename)
    return (
        f"# {title}\n\n"
        "Generated from the Postman export. Prose added outside the markers below is "
        "preserved when this file is regenerated.\n\n"
        f"{BEGIN}\n{END}\n"
    )


def splice(filename: str, generated: str) -> str:
    """Write `generated` between the markers, preserving everything outside them."""
    target = OUT_DIR / filename
    if not target.exists():
        target.write_text(stub(filename))
    original = target.read_text()
    if BEGIN not in original or END not in original:
        raise SystemExit(
            f"ERROR: {target} exists but has no {BEGIN} / {END} markers. "
            "Refusing to overwrite hand-written content."
        )
    head, rest = original.split(BEGIN, 1)
    _, tail = rest.split(END, 1)
    new = f"{head}{BEGIN}\n{WARNING}\n\n{generated.rstrip()}\n\n{END}{tail}"
    if new != original:
        target.write_text(new)
        return "updated"
    return "unchanged"


def main() -> int:
    if not COLLECTION.exists():
        raise SystemExit(f"ERROR: collection not found at {COLLECTION}")

    raw = COLLECTION.read_text()

    # A re-export taken after actually using Postman would carry a live 30-day
    # bearer token. Refuse to run rather than commit one into the docs.
    leaked = set(re.findall(r"\b\d+\|[A-Za-z0-9]{40,}\b", raw))
    if leaked:
        raise SystemExit(
            f"ERROR: {len(leaked)} bearer token(s) found in {COLLECTION.name}. "
            "Redact them (replace with <REDACTED_TOKEN>) before regenerating."
        )

    collection = json.loads(raw)

    for var in collection.get("variable", []):
        if var.get("key") in {"token", "googleIdToken"} and var.get("value"):
            raise SystemExit(
                f"ERROR: collection variable '{var['key']}' is non-empty. "
                "Clear it before committing — it is a live credential."
            )

    endpoints = list(walk(collection.get("item", [])))

    n_resp = sum(len(item.get("response") or []) for _, item in endpoints)
    if len(endpoints) != EXPECT_ENDPOINTS or n_resp != EXPECT_RESPONSES:
        raise SystemExit(
            f"ERROR: expected {EXPECT_ENDPOINTS} endpoints / {EXPECT_RESPONSES} "
            f"responses, found {len(endpoints)} / {n_resp}. "
            "If the collection legitimately changed, update EXPECT_* in this script."
        )

    unknown = {g for g, _ in endpoints if g not in GROUP_FILE}
    if unknown:
        raise SystemExit(f"ERROR: collection groups not mapped to a file: {unknown}")

    # group -> markdown, keeping collection order
    sections: dict[str, list[str]] = {}
    counts: dict[str, int] = {}
    for group, item in endpoints:
        filename = GROUP_FILE[group]
        block = sections.setdefault(filename, [])
        if not block or block[-1] != f"## {group}":
            if group not in {ln[3:] for ln in block if ln.startswith("## ")}:
                block.append(f"## {group}")
                block.append("")
        block.extend(render_endpoint(item))
        counts[filename] = counts.get(filename, 0) + 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename in sorted(sections):
        status = splice(filename, "\n".join(sections[filename]))
        print(f"  {filename:20} {counts[filename]:2} endpoints  [{status}]")

    print(f"OK — {len(endpoints)} endpoints, {n_resp} responses across "
          f"{len(sections)} files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
