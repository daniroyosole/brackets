import type { Sentence } from "./models/sentence";

export const initialSentence: Sentence= {
    text: 'Primera pista de prova',
    clues: [
      {
        text: "Amazón pagant més",
        value: 'Prime',
        startIndex: 0,
        clues: [
          {
            text: "President valencià",
            value: "mazón",
            startIndex: 1,
            clues: [
              {
                text: "A la boca, uns trenta",
                value: "dent",
                startIndex: 5,
              }
            ]
          },
          {
            text: "Formiga britanica",
            value: "ant",
            startIndex: 10,
          }
        ]
      },
      {
        text: "això mateix",
        value: "pista",
        startIndex: 8,
      },
      {
        text: "val 26 lliures i equival a 10,4 kg",
        value: "rova",
        startIndex: 18,
      }
  ]
}
