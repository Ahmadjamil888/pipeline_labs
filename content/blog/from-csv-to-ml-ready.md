---
title: "From Raw CSV to ML-Ready Dataset in 5 Minutes"
date: "2026-03-10"
excerpt: "A step-by-step walkthrough of uploading a messy real-world dataset and getting it production-ready with Pipeline Labs."
author: "Ahmad Jamil"
tag: "Tutorial"
readTime: "7 min read"
---

## Starting With Messy Data

Real-world data is never clean. Let's take a typical e-commerce transaction dataset with:

- Missing customer ages
- Inconsistent date formats
- Mixed currency values
- Duplicate transaction IDs

## Step 1: Upload

Drag your CSV into Pipeline Labs. The system immediately runs a data quality scan and shows you:

- Column types detected
- Missing value percentages
- Potential duplicates
- Distribution summaries

## Step 2: Describe Your Goal

Type your preprocessing goal in natural language:

```
Remove duplicate transaction IDs, fill missing ages with median,
standardize dates to ISO format, convert all prices to USD,
and normalize the amount column.
```

## Step 3: Review the Pipeline

Pipeline Labs generates a step-by-step transformation plan. You can review each step, modify it, or add new ones before running.

## Step 4: Download

Click run. In seconds, you get a clean dataset ready for your model — plus an optional Python script that reproduces the exact same transformations.

## What You Get

- Clean, typed dataset
- Transformation audit log
- Exportable Python code
- Train/test split (optional)

The whole process takes under 5 minutes for most datasets under 50,000 rows.

---

[Try it yourself →](/dashboard)
