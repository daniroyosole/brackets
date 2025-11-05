import type { Sentence } from "./models/sentence";

export const initialSentence: Sentence = {
  "text": "Avui sembla que plou",
  "clues": [
    {
      "text": "Unió Europea",
      "value": "ue",
      "startIndex": 13
    },
    {
      "text": "Onomatopeia d'un xerraire",
      "value": "bla",
      "startIndex": 8,
      "clues": [
        {
          "text": "Va molt bé amb la mel",
          "value": "mato",
          "startIndex": 3,
          "clues": [
            {
              "text": "Trinxat, com el cafè",
              "value": "molt",
              "startIndex": 3
            }
          ]
        },
        {
          "text": "Vent",
          "value": "aire",
          "startIndex": 21
        }
      ]
    },
    {
      "text": "Avinguda curta",
      "value": "Av",
      "startIndex": 0,
      "clues": [
        {
          "text": "No arriba a ser pel·lícula",
          "value": "curt",
          "startIndex": 9,
          "clues": [
            {
              "text": "Amb dra-, el vampir més famós",
              "value": "cula",
              "startIndex": 22,
              "clues": [
                {
                  "text": "Gana",
                  "value": "fam",
                  "startIndex": 24
                },
                {
                  "text": "Li té por a l'all i les creus",
                  "value": "vampir",
                  "startIndex": 13,
                  "clues": [
                    {
                      "text": "A prop de Tarragona, té aeroport",
                      "value": "reus",
                      "startIndex": 25
                    }
                  ]
                },
                {
                  "text": "Doctora",
                  "value": "dra",
                  "startIndex": 4
                }
              ]
            },
            {
              "text": "Li crides al cavall quan va lent",
              "value": "arri",
              "startIndex": 3,
              "clues": [
                {
                  "text": "Perfecte per brindar l'any nou",
                  "value": "cava",
                  "startIndex": 13
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
