---
title: Lumen
order: 5
size: compact
role: Creator
tagline: On-device AI desktop photo gallery
published: 2026-10-30
summary: An on-device AI desktop photo gallery in Go. No accounts, no uploads, no telemetry.
description: How Awais Jameel built Lumen, an on-device AI desktop photo gallery in Go with local search, signed updates, and no uploads.
lede: I built Lumen, a Windows-first desktop gallery that organizes large photo libraries with AI running on your own PC.
details:
  - label: product
    value: Desktop photo and video gallery
  - label: stack
    value: Go, Wails, Vue, TypeScript
  - label: AI
    value: ONNX Runtime, on-device
image:
  src: /images/lumen.webp
  alt: The Lumen library, a timeline of sample photos grouped by day
  width: 1400
  height: 875
link:
  label: View on GitHub
  href: https://github.com/awaisjameel/lumen
stats:
  - value: 'v0.12.0'
    label: released 20 Oct 2026
  - value: 'Local'
    label: AI runs on your own PC
  - value: '0'
    label: accounts, uploads, or telemetry
  - value: 'Go'
    label: native desktop stack
statsNote: Release details as of 20 October 2026. Lumen is in beta. The screenshot uses sample photos.
---

## The problem

Good photo search usually means uploading your whole library to someone else's cloud. I wanted the same experience from a private app: describe a photo and find it, recognize people, and browse by place and event, with nothing leaving the computer.

## My role

Lumen is my own product and a public repository. I designed and built it, including the desktop app, the on-device AI pipeline, the installer, and the update system. The first public release shipped within a month.

## What it does

Lumen reads photos where they already are, so it doesn't copy, import, or move them. It adds plain-language search and automatic People, Things, Places, and Events. Its timeline handles hundreds of thousands of photos, and it opens RAW, HEIC, and JPEG XL files along with video.

## Key decisions

### AI runs on the device

Models run locally through ONNX Runtime. There's no account, upload, or telemetry, so privacy comes from how the product works. Indexing happens in the background and pauses on battery or while the PC is busy.

### A native app built with familiar tools

The backend is Go and the interface is Vue with TypeScript, joined by Wails. SQLite holds the index and FFmpeg handles video. This was a deliberate step outside my usual Laravel work, and it shows the same engineering habits on a different platform.

### Files are treated with care

Originals are never edited. Moves and renames are previewed and can be undone, deletion goes to the Recycle Bin, and private items can be blocked behind a PIN.

### Updates are signed

Updates use a TUF and sigstore-signed chain, so the app can verify what it installs. For software that sits beside a person's private photos, the update path deserves as much care as the features.

## Why it matters

Lumen shows range beyond web platforms: applied machine learning, native desktop delivery, and a security-conscious release process, all in a public repository anyone can read.
