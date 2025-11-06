import type { Sentence } from "./models/sentence";

export const sentences: Sentence[] = [{
  "date": "2025-11-06",
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
}, {
  "date": "2025-11-07",
  "text": "La Rosalia ha tret disc",
  "clues": [
    {
      "text": "Per Sant Jordi va molt cara",
      "value": "Rosa",
      "startIndex": 3,
      "clues": [
        {
          "text": "Un dau en té sis (singular)",
          "value": "cara",
          "startIndex": 23,
          "clues": [
            {
              "text": "Ho he pillat, ho he _____",
              "value": "en té s",
              "startIndex": 7,
              "clues": [
                {
                  "text": "Diagonal, deserta o de la discòrdia",
                  "value": "illa",
                  "startIndex": 7,
                  "clues": [
                    {
                      "text": "Monopoly __, Pokemon __, Sushi __",
                      "value": "go",
                      "startIndex": 3,
                      "clues": [
                        {
                          "text": "Un bowl amb arròs, salmó i alvocat",
                          "value": "Poke",
                          "startIndex": 13
                        }
                      ]
                    },
                    {
                      "text": "Honestament t'ho diu amb això a la ma",
                      "value": "còr",
                      "startIndex": 29,
                      "clues": [
                        {
                          "text": "Amb t-, motiu de disputa entre germans orfes",
                          "value": "estament",
                          "startIndex": 3
                        }
                      ]
                    },
                    {
                      "text": "Amb sort hi trobes un oasi",
                      "value": "desert",
                      "startIndex": 10,
                      "clues": [
                        {
                          "text": "Al Pallars Sobirà hi venen loteria",
                          "value": "sort",
                          "startIndex": 4
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
    },
    {
      "text": "S'embolica parda",
      "value": "lia",
      "startIndex": 7,
      "clues": [
        {
          "text": "Bic, el més conegut",
          "value": "boli",
          "startIndex": 4,
          "clues": [
            {
              "text": "El de trànsit és taronja",
              "value": "con",
              "startIndex": 12,
              "clues": [
                {
                  "text": "Què era abans, la fruita o el color?",
                  "value": "taronja",
                  "startIndex": 17,
                  "clues": [
                    {
                      "text": "En porta la truita cuita",
                      "value": "uita",
                      "startIndex": 20,
                      "clues": [
                        {
                          "text": "Sant Pere guarda la del cel",
                          "value": "porta",
                          "startIndex": 3
                        },
                        {
                          "text": "Amb ceba o sense ceba?",
                          "value": "truita",
                          "startIndex": 12
                        }
                      ]
                    }
                  ]
                },
                {
                  "text": "Els camions del colectiu",
                  "value": "tràns",
                  "startIndex": 6,
                  "clues": [
                    {
                      "text": "A Brusel·les també n'hi ha de Kale",
                      "value": "col",
                      "startIndex": 16
                    },
                    {
                      "text": "Un d'aquests et porta a Roma",
                      "value": "cami",
                      "startIndex": 4,
                      "clues": [
                        {
                          "text": "Capgirat l'amor",
                          "value": "Roma",
                          "startIndex": 24
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
}]

