---
title: ToolHub
order: 3
size: compact
role: Creator
summary: 54 privacy-first browser tools for images, PDFs, text, and developer work. Built on Nuxt 4.
description: How Awais Jameel built ToolHub, 54 privacy-first browser tools on Nuxt 4 that process files on the visitor's own device by default.
lede: I built ToolHub, a live suite of 54 privacy-first browser tools that work on your own device by default.
details:
  - label: product
    value: Browser utility suite
  - label: stack
    value: Nuxt 4, Nuxt UI, TypeScript, Node 24
  - label: delivery
    value: AWS
image:
  src: /images/toolhub.webp
  alt: The ToolHub home page, listing browser tools by category
  width: 1440
  height: 900
link:
  label: toolhub.afoxtech.com
  href: https://toolhub.afoxtech.com
stats:
  - value: '54'
    label: browser tools
  - value: 'Local'
    label: file processing by default
  - value: '23'
    label: SEO articles indexed in May 2026
  - value: 'Live'
    label: public product
statsNote: Tool count from the product's documentation and live site, checked 21 October 2026.
---

## The problem

Everyday file tasks, like compressing a PDF or converting an image, usually mean uploading a private document to a stranger's server. Most of these jobs don't need a server at all, because a modern browser can do the work itself.

ToolHub is my answer to that. It's a free collection of utilities that process files in the browser by default, with server fallbacks where a task needs one.

## My role

ToolHub is my own product, so I own all of it: product decisions, design, engineering, deployment, and search.

## What it does

There are 54 tools across images, PDFs and documents, text, developer utilities, SEO, generators, and calculators. They range from image conversion and PDF merging to a JSON formatter, a JWT decoder, and a loan amortizer.

## Key decisions

### Work happens on the visitor's device

Local processing is the default, so most files never leave the visitor's device. Heavier engines run in the browser through WebAssembly, including a compiled version of qpdf for adding or removing PDF passwords.

### Every page is a real page

Nuxt prerenders the tool, category, and article pages. Search engines and link previews get complete HTML, and each tool can rank for its own task. That matters for a product that grows mainly through search.

### Tools share one structure

With more than 50 tools, consistency has to come from the system. A shared structure and scaffolding script give every new tool the same layout, metadata, and behavior, so the suite stays maintainable as it grows.

### It behaves like an app

ToolHub installs as a progressive web app and picks up new releases automatically. A release only activates after it has downloaded successfully, so a failed update leaves the current version working.

### Small deployment, production habits

It runs as a small Nuxt server with security headers, rate limits on API routes, and a repeatable release process.

## Why it matters

ToolHub is the most inspectable thing in this portfolio. Most of my professional work is private, while anyone can open this one and try it.
