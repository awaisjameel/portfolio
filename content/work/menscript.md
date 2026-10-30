---
title: MenScript
order: 3
size: large
role: Freelance senior full-stack developer
summary: A multi-country men's telehealth and subscription commerce platform. I led its full-stack modernization across subscription billing, identity verification, prescription-oriented workflows, localization, fulfillment integrations, performance, and deployment.
description: How Awais Jameel led the full-stack modernization of MenScript, a multi-country men's telehealth and subscription commerce platform built with Laravel and Nuxt.
lede: I've worked on MenScript since 2021, and I led the move from separate frontends and backends to one Laravel and Nuxt platform.
facts:
  - value: '1,000+'
    label: commits across four code generations
  - label: measured 21 Oct 2026
details:
  - label: product
    value: Telehealth and subscription commerce
  - label: stack
    value: Laravel, Nuxt, TypeScript, Redis
  - label: delivery
    value: Scripted staging and deployment
link:
  label: menscript.com
  href: https://menscript.com/
stats:
  - value: '1,000+'
    label: commits of mine
  - value: '4'
    label: code generations
  - value: 'Multi-country'
    label: localized storefronts
  - value: '2021'
    label: start of my work on the platform
statsNote: Commit counts were measured on 21 October 2026. This is proprietary software, so customer and patient data, credentials, and internals stay off this page. Nothing here describes a formal compliance certification.
---

## The problem

MenScript is an online men's health service. A single order can involve a health assessment, identity verification, a recurring payment, physician review, and fulfillment, so one weak step affects the whole journey.

The product had grown through separate frontend and backend generations, and it had to keep serving customers while the platform underneath it changed.

## My role

I started on the project in October 2021, and I've worked on it as a freelance senior full-stack developer since October 2022. I've been the dominant contributor since 2023 and led the full-stack modernization. Other engineers built parts of the earlier generations, so the platform's history is shared work.

## From separate codebases to one platform

The platform moved through an Express backend, Nuxt 2 and Nuxt 3 frontends, and a Laravel backend before everything came together in one repository. The Laravel API and the Nuxt frontend now work to an explicit contract, which helps keep a change on one side from breaking the other.

## The workflows behind an order

Most of the work sits where the product meets outside services and real business rules:

- Recurring billing through Chargebee, with webhooks keeping orders and invoices in step.
- Identity verification through DiDiT, synced in the background. I also wrote community-built DiDiT SDKs for Laravel and Node.
- Health assessments, with separate dashboards for customers, physicians, and administrators.
- Fulfillment integrations that map orders and invoices to what a partner expects.

Payment and patient flows are built to be security- and privacy-conscious throughout.

## Serving more than one country

Pages, products, categories, and articles are translatable in one content model. Each storefront has its own locale and shipping country, on the same platform.

## Speed and reach

Laravel Octane, Horizon queues, and Redis keep the API responsive and move slow work out of the request. On the frontend, server-side rendering, image and font optimization, and structured data support search, which matters for a health service that people find through their own questions.
