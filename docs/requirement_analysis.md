# Order Lifecycle Requirements Analysis

## Overview

This document analyzes the client requirements for a **multi-board, multi-state order lifecycle system** where orders are tracked across three independent dimensions:

| Dimension | Owner | Question It Answers |
|-----------|-------|---------------------|
| **Picking Status** | Warehouse | Has the order been physically picked? |
| **Driver Visibility** | System | Can the driver see this order? |
| **Delivery Status** | Driver | Has the order been delivered? |

---

## Core Principle

> **One order, multiple views, separate statuses.**

An order doesn't move between boards—it exists on multiple boards simultaneously, with each board showing a different aspect of its lifecycle.

---

## Order Journey Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORDER CREATED                            │
│                   (JOBBER or DODD type)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│     PICKING BOARD       │     │         DRIVER BOARD            │
│  • Shows as "Not Picked"│     │  • Shows with green ✓           │
│  • Warehouse works here │     │  • Green ✓ = scheduled, NOT     │
│                         │     │    picked                       │
└─────────────────────────┘     └─────────────────────────────────┘
              │                               │
              │ Warehouse marks "Picked"      │
              ▼                               │
┌─────────────────────────┐                   │
│   REMOVED from          │                   │
│   Picking Board         │                   │
└─────────────────────────┘                   │
                                              │
                              ┌───────────────┘
                              │ Order now shows "Ready/Picked"
                              ▼
              ┌─────────────────────────────────┐
              │         DRIVER BOARD            │
              │  • Still visible                │
              │  • Now shows "Picked & Ready"   │
              └─────────────────────────────────┘
                              │
                              │ Driver marks "Delivered"
                              ▼
              ┌─────────────────────────────────┐
              │       COMPLETED ORDERS          │
              │  • Visible for 7 days           │
              │  • Then auto-archived           │
              └─────────────────────────────────┘
```

---

## Detailed Requirements

### A. Order Creation & Visibility

| Requirement | Description |
|-------------|-------------|
| Single Record | Create one order record, not duplicates |
| Dual Board Display | Order appears on Picking Board AND Driver Board simultaneously |
| Same Data Source | Both boards reference the same order, just different views |

### B. Picking Board Logic

| Current State | User Action | Result |
|---------------|-------------|--------|
| Order created | — | Appears as "Not Picked" |
| Not Picked | Warehouse marks "Picked" | **Removed** from Picking Board |
| — | — | Order is NOT completed or archived |
| — | — | Driver Board is NOT affected |

### C. Driver Board Logic

| Indicator | Meaning | What It Does NOT Mean |
|-----------|---------|----------------------|
| Green ✓ | Order is active & scheduled | Order is picked |
| Green ✓ | Order is assigned to delivery slot | Warehouse has completed work |
| "Ready" label | Warehouse has picked the order | Order is delivered |

**Key Rule:** Green checkmark only indicates visibility/scheduling, NOT picking status.

### D. Delivery & Fulfillment

| Driver Action | System Response |
|---------------|-----------------|
| Mark as "Delivered" | Remove from Driver Board |
| Mark as "Delivered" | Move to Completed Orders |
| Mark as "Delivered" | Record completion timestamp |

### E. Archiving Rules

| Timeframe | Status | Visibility |
|-----------|--------|------------|
| 0-7 days after completion | Completed | Visible in Completed Orders |
| 7+ days after completion | Archived | Hidden from all active boards |

---

## State Definitions

The system must track these **independent states**:

```
┌──────────────────────────────────────────────────────────────┐
│                     ORDER STATES                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  pickingStatus:    "not_picked" → "picked"                   │
│                                                              │
│  driverVisibility: "visible" → "hidden" (after delivery)    │
│                                                              │
│  deliveryStatus:   "pending" → "delivered" → "archived"     │
│                                                              │
│  completedAt:      null → timestamp (when delivered)        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Order Creation
- [ ] When JOBBER/DODD order is created, set `pickingStatus = "not_picked"`
- [ ] Automatically show on Picking Board
- [ ] Automatically show on Driver Board based on fulfillment date
- [ ] Display green ✓ on Driver Board (does NOT mean picked)

### Picking Board
- [ ] Filter: Show orders where `pickingStatus = "not_picked"`
- [ ] On "Mark as Picked": Set `pickingStatus = "picked"`
- [ ] After picking: Order disappears from Picking Board only

### Driver Board
- [ ] Filter: Show orders where `deliveryStatus = "pending"`
- [ ] Show green ✓ for all visible orders (scheduled indicator)
- [ ] Show "Ready" badge when `pickingStatus = "picked"`
- [ ] On "Mark as Delivered": Set `deliveryStatus = "delivered"` and `completedAt = now()`

### Completed Orders
- [ ] Filter: Show orders where `deliveryStatus = "delivered"` AND `completedAt < 7 days ago`
- [ ] Auto-archive: Background job to set `deliveryStatus = "archived"` after 7 days

---

## Summary

| Board | Shows Orders Where | Removed When |
|-------|-------------------|--------------|
| **Picking Board** | `pickingStatus = "not_picked"` | Marked as "Picked" |
| **Driver Board** | `deliveryStatus = "pending"` | Marked as "Delivered" |
| **Completed Orders** | `deliveryStatus = "delivered"` AND within 7 days | After 7 days (auto-archived) |

**One-Sentence Rule:**
> A JOBBER/DODD order is visible to drivers before it is picked, removed from picking once picked, completed only after delivery, and archived after 7 days.
