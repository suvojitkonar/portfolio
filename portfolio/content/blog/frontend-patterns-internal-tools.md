---
slug: frontend-patterns-internal-tools
title: Frontend patterns for internal tools
excerpt: How we balanced speed and maintainability when shipping dashboards and admin UIs for platform teams.
publishedAt: "2024"
tags:
  - React
  - UX
---

Internal tools often compete with roadmap work, so the UI has to be cheap to build and easy to extend. We leaned on a small design vocabulary—consistent tables, forms, and filters—instead of one-off layouts per screen.

Colocating API types and hooks with feature folders reduced drift between backend and frontend. When the API changed, TypeScript failures pointed us to the exact screens to update.

We treated accessibility and keyboard flows as part of the default, not a polish pass. That paid off when power users lived in these UIs for hours a day. Simple wins: focus management on dialogs, visible labels, and sane tab order.
