---
title: One Pro Suite
order: 1
size: large
role: Lead architect
summary: A modular, multi-tenant insurance quoting SaaS with schema-driven intake, multi-carrier orchestration, realtime quote delivery, and blue/green AWS deployments.
description: How Awais Jameel architected One Pro Suite, a modular, multi-tenant insurance quoting SaaS with 17 carrier integrations and blue/green AWS deployments.
lede: I architect and build a modular, multi-tenant insurance quoting SaaS for agencies, producers, and consumers.
visual: tally
facts:
  - value: '450+'
    label: automated test files
  - value: '15'
    label: GitHub Actions workflows
  - label: measured 21 Oct 2026
details:
  - label: product
    value: Quoting and operations SaaS
  - label: stack
    value: Laravel, Inertia, Vue, TypeScript
  - label: delivery
    value: Blue/green on AWS
stats:
  - value: '17'
    label: carrier integrations
  - value: '18'
    label: backend modules
  - value: '450+'
    label: automated test files
  - value: '15'
    label: GitHub Actions workflows
statsNote: Measured in the codebase on 21 October 2026. This is proprietary software, so customer details, carrier names, and internals stay off this page.
---

## The problem

From an agent's side, a quote looks like one question. Behind the screen it becomes many requests to carriers that each have their own rules, data, and failure modes.

A slow provider shouldn't hold up the agent, and adding a carrier shouldn't mean rewriting the product. The platform also had to serve agencies, producers, and consumers while keeping each company's data separate. It needed to absorb all of that variety and stay simple to work on.

## My role

I lead the architecture and work hands-on in the code with the team. That covers the module structure, the integration boundary, the contracts between backend and frontend, and how releases reach production. The team builds on that foundation, so the product is shared work. The decisions below are the ones I'm responsible for.

## How a quote moves

Every quote follows the same path, whichever product or carrier is involved. That consistency is what makes the rest of the system easy to reason about.

<!-- diagram:quote-lifecycle -->

## Key decisions

Most of the decisions below shape the same picture: every request passes one shared core, and carrier differences stay at the edge.

<!-- diagram:platform-layers -->

### Forms come from schemas

Intake is schema-driven, so the questions can change by product without a new screen for each one. Data providers can then fill in what is already known, which saves the agent from typing it again.

### Carriers sit behind one boundary

Each carrier connects through an explicit contract. Product code depends on a capability, and the differences between carriers stay behind the boundary. External providers are rarely consistent, so this boundary does a lot of the work in the system.

### Types come from the backend

Typed Laravel-to-TypeScript contracts mean the backend defines the shape of the data and the frontend receives it. That removes a common source of regressions in a large product, where two sides of the same feature slowly drift apart.

### Tenancy and access are part of the foundation

Tenant-aware roles, encrypted integration credentials, and audit history sit in the core of the platform. Every module inherits them, so a new feature starts with the same rules as the rest of the product.

### Releases can be reversed

One immutable build moves through environments, and production uses blue/green deployments on AWS with health checks and rollback. Database changes follow an expand and contract approach, so rolling back code doesn't need a destructive schema change.

<!-- diagram:blue-green-release -->

## What it adds up to

The result is a consistent way to extend the platform. New modules and carriers follow the same path, with the same types, tests, and release process around them.
