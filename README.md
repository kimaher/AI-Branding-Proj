# Prompt-to-Storyboard Generator

A lightweight web app that converts a short story or scene description into a visual storyboard using OpenAI’s Image Generation API.

The user provides text, the app splits it into narrative beats, and generates one storyboard frame per beat.

---

## What This Does

1. Takes a short story or scene description
2. Splits the text into a small number of story beats
3. Generates one image per beat using a consistent prompt structure
4. Displays the result as a storyboard grid in the browser

The goal is to demonstrate structured, repeatable use of image generation for visual storytelling.

---

## Why This Project

Storyboards are commonly used in film, animation, and game design to visualize scenes before production.

This project shows how text can be transformed into a sequence of visual frames using:
- Deterministic text processing
- Consistent prompt engineering
- Multiple image generations from a single input

---

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **API:** OpenAI Image Generation API
- **Runtime:** Local Express server

No database. No authentication. No frontend framework.

---

## How It Works

### 1. Input
The user enters a short story or scene description and selects:
- Visual style
- Maximum number of frames

### 2. Beat Splitting
The text is:
- Cleaned and normalized
- Split into sentences
- Grouped into up to `maxBeats` chunks

Each chunk becomes one storyboard beat.

### 3. Image Generation
For each beat:
- A structured prompt is constructed
- One image is generated via the Image API
- The image is returned as base64 and rendered in the browser

### 4. Output
The browser displays:
- One image per beat
- The associated beat text under each frame

---

## Example Prompt Structure

```text
Storyboard frame, cinematic film still.
Scene: The hero enters an abandoned warehouse at night.
Composition: clear subject, simple background.
Camera: wide shot.
Lighting: dramatic, high contrast.
No text, no captions.