---
id: data-pipeline-toolkit
title: Data pipeline toolkit
description: Batch and streaming jobs for large-scale analytics with Spark and Hadoop, including observability hooks.
tags:
  - Spark
  - Hadoop
  - Scala
repo: "#"
order: 2
---

## Overview

Built a dataplatform for Mindtree Ltd, which supports **batch and streaming** workloads on Spark and Hadoop, with hooks for metrics and logging so jobs are observable in production.

## What I focused on

- Shared job configuration and validation to cut down copy-paste
- Consistent naming and partitioning conventions for downstream consumers
- Lightweight instrumentation points (timings, row counts, failure reasons)
- Highly scalable and performant distribiuted system

## Outcome

Teams could stand up new pipelines faster and debug failures without digging through ad-hoc logs.
