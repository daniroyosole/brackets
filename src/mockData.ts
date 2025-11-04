import type { Sentence } from "./models/sentence";

export const initialSentence: Sentence = {
  "text": "El pobre Met havia vingut al món com per art d'encantament. - Drames Rurals",
  "clues": [
    {
      "text": "No són comèdies",
      "value": "Drames",
      "startIndex": 62
    },
    {
      "text": "Del camp",
      "value": "Rurals",
      "startIndex": 69,
      "clues": [
        {
          "text": "El Nou és a prop del metro Badal",
          "value": "camp",
          "startIndex": 4,
          "clues": [
            {
              "text": "Amb una ona està al Maresme",
              "value": "Badal",
              "startIndex": 27,
              "clues": [
                {
                  "text": "La comarca més lliure i tropical!!",
                  "value": "Maresme",
                  "startIndex": 20
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "text": "Té poca pasta",
      "value": "pobre",
      "startIndex": 3,
      "clues": [
        {
          "text": "Pot ser fresca o gansa",
          "value": "pasta",
          "startIndex": 8,
          "clues": [
            {
              "text": "El que li cridava la iaia del David a l'Emma",
              "value": "fresca",
              "startIndex": 8
            }
          ]
        }
      ]
    },
    {
      "text": "Al revés també es diu farigola",
      "value": "Met",
      "startIndex": 9
    },
    {
      "text": "El meu",
      "value": "món",
      "startIndex": 29,
      "clues": [
        {
          "text": "Mira que en són d'egoistes els gats",
          "value": "meu",
          "startIndex": 3,
          "clues": [
            {
              "text": "No comparteixen",
              "value": "egoistes",
              "startIndex": 18
            }
          ]
        }
      ]
    },
    {
      "text": "decó, nouveau, contemporani",
      "value": "art",
      "startIndex": 41,
      "clues": [
        {
          "text": "Un nou francès",
          "value": "nouveau",
          "startIndex": 6
        }
      ]
    },
    {
      "text": "Agrada molt",
      "value": "encanta",
      "startIndex": 47
    },
    {
      "text": "Una pot ser recargolada o estar en blanc",
      "value": "ment",
      "startIndex": 54,
      "clues": [
        {
          "text": "Aquesta escala dona voltes",
          "value": "cargol",
          "startIndex": 14,
          "clues": [
            {
              "text": "La pentatònica te cinc notes",
              "value": "escala",
              "startIndex": 8
            }
          ]
        },
        {
          "text": "A en Benoit no li agraden els punyals per l'esquena",
          "value": "blanc",
          "startIndex": 35,
          "clues": [
            {
              "text": "crol, braça, papallona, _____",
              "value": "esquena",
              "startIndex": 44,
              "clues": [
                {
                  "text": "Amb un cop d'ala provoca un huracà",
                  "value": "papallona",
                  "startIndex": 13,
                  "clues": [
                    {
                      "text": "L'11 i el 14 al rugby",
                      "value": "ala",
                      "startIndex": 13,
                      "clues": [
                        {
                          "text": "El de setembre és diada",
                          "value": "11",
                          "startIndex": 2,
                          "clues": [
                            {
                              "text": "Te'n recordes? D'Earth, Wind and Fire",
                              "value": "setembre",
                              "startIndex": 6
                            }
                          ]
                        },
                        {
                          "text": "set per dos",
                          "value": "14",
                          "startIndex": 10,
                          "clues": [
                            {
                              "text": "Estrip",
                              "value": "set",
                              "startIndex": 0
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
