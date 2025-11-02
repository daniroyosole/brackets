# Brackets

A word puzzle game where players solve clues hidden within sentences. Each clue can contain nested clues, creating a multi-level puzzle experience.

## Features

- **Play Mode**: Solve clues by entering answers. Clues become eligible when all nested clues are solved.
- **Generate Mode**: Create custom puzzles by selecting text from sentences and adding clues recursively.
- **Nested Clues**: Build puzzles with unlimited levels of nested clues.
- **Minimal Design**: Clean, black-and-white newspaper-style interface.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build

```bash
npm run build
```

## How to Play

### Play Mode

1. Enter a sentence in JSON format (or use the default example).
2. The sentence appears with clues wrapped in brackets `[ ]`.
3. Eligible clues (those with no nested clues or all nested clues solved) are highlighted.
4. Enter answers in the input field.
5. Correct answers reveal the clue's value and unlock any parent clues.

### Generate Mode

1. Enter your main sentence and click Submit.
2. Select a portion of text from the sentence.
3. Enter a clue description (what players will see).
4. Click Create Clue to add it to the puzzle.
5. Repeat for nested clues by selecting text within existing clue descriptions.
6. View the JSON result at the bottom and copy it to use in Play Mode.

## Sentence Format

A sentence is represented as a JSON object:

```json
{
  "text": "Primera pista de prova",
  "clues": [
    {
      "text": "Amazón pagant més",
      "value": "Prime",
      "startIndex": 0,
      "clues": [
        {
          "text": "President valencià",
          "value": "mazón",
          "startIndex": 1
        }
      ]
    }
  ]
}
```

- `text`: The sentence or clue description
- `value`: The answer players must guess
- `startIndex`: Position where the clue appears in the parent text
- `clues`: Optional array of nested clues

## Technologies

- React 19
- TypeScript
- Vite
- React Router

## License

Private project
