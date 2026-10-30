---
title: RocketMGA and RocketFlood
order: 2
size: large
role: Primary contributor since 2020
tagline: Flood insurance MGA and agency platforms
published: 2026-10-30
summary: A multi-tenant flood insurance MGA and agency platform with comparative rating, onboarding, quoting, and policies. I helped cut quoting from 30 minutes by hand for one carrier to 30 seconds across 20+ carrier programs with Redis caching, parallel carrier calls, request batching, and asynchronous delivery.
description: How Awais Jameel helped build RocketMGA and RocketFlood, cutting quoting from 30 minutes by hand for one carrier to 30 seconds across 20+ programs.
lede: I've been the primary contributor to RocketMGA and the RocketFlood agent portal since 2020, working across quoting, carrier integrations, and performance.
visual: speed
facts:
  - value: '1,100+'
    label: companies and agencies
  - value: '20+'
    label: carrier programs and integrations
details:
  - label: product
    value: Flood insurance MGA and agency platform
  - label: stack
    value: Laravel, Vue, Nuxt, Redis, MySQL
  - label: delivery
    value: AWS
link:
  label: rocketmga.com
  href: https://rocketmga.com
stats:
  - value: '1,100+'
    label: companies and agencies
  - value: '20+'
    label: carrier programs and integrations
  - value: '30 s'
    label: to quote 20+ carrier programs, down from 30 minutes by hand for one
  - value: '2020'
    label: start of my work on the platform
statsNote: Scale and performance figures come from my production work on these proprietary platforms. Code, carrier credentials, and customer data stay off this page.
---

## The problem

RocketFlood is a family of flood and property insurance products: a consumer quote engine, an agent portal, and RocketMGA, a multi-tenant MGA and agency platform. Agents use these products to compare options across carrier programs, so a slow quote is a direct business problem.

Quoting by hand took an agent 30 minutes for a single carrier, and comparing options meant repeating that work for each one.

## My role

I've been the primary contributor to RocketMGA and the RocketFlood agent portal since 2020, as part of the NBTHub team. My work runs across architecture, implementation, carrier integrations, performance, and release practices. I've kept delivering on these products as they moved through several generations of frameworks and infrastructure.

## Cutting quote time

The platform replaces that manual work with one quoting flow across 20+ carrier programs, and the answer comes back in 30 seconds.

<!-- diagram:quote-speed -->

Keeping that fast across so many programs took a few deliberate choices:

- Redis caching for repeatable property and address data.
- Parallel calls to carriers that didn't depend on each other.
- Request batching to reduce unnecessary round trips.
- Timeouts and fallbacks, so one slow provider couldn't block the others.
- Asynchronous delivery, so partial results reached the screen as they arrived.

Quoting went from 30 minutes by hand for one carrier to 30 seconds across 20+ carrier programs.

## Keeping many carriers manageable

Carriers expose different APIs, fields, timing, and errors. A canonical application model keeps the product consistent, with each carrier handled behind its own adapter. Statuses, results, and errors are normalized before the rest of the product sees them, and integration calls are recorded for audit.

## Long-term ownership

Long-lived insurance software has to keep working while it changes. These products evolved across Laravel, Vue, Nuxt, authentication, and infrastructure generations while features kept shipping. That meant modularizing integrations, improving caching and queues, and updating frontend foundations in steps, with code review alongside.

I've also led security hardening and audit remediation.
