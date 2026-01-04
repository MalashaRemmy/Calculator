# Calculator — Foundations Project

A production-ready, on-screen calculator built with **HTML, CSS, and Vanilla JavaScript**, designed using **explicit state management** rather than shortcuts like `eval()`.

This project focuses on correctness, clarity, and long-term maintainability.

---

## Overview

This calculator supports:

- Basic arithmetic operations (`+`, `−`, `×`, `÷`)
- Chained calculations (e.g. `12 + 7 − 1 =`)
- Decimal input with validation
- Backspace and clear functionality
- Division-by-zero protection
- Rounded results to prevent display overflow
- UI behavior consistent with real calculators
- **Full keyboard support**

The logic is implemented as a **state-driven system**, not display-driven scripting.

---

## Core Design Principle

> **UI triggers events.  
Events mutate state.  
State determines behavior.**

The display is a visual output only — it does not control logic.

---

## Project Structure

calculator\
- index.html # Semantic structure
- style.css # Layout and visual styling
- script.js # State management and logic
- README.md # Documentation

