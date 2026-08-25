// Centralized Question Database for The English Path
// Supports 6 interactive question types across Beginner, Intermediate, and Advanced tiers:
// 1. mcq (Multiple Choice)
// 2. fill-blank (Fill in the Blanks)
// 3. sentence-correction (Sentence Correction & Error Spotting)
// 4. true-false (True or False Cards)
// 5. matching (Interactive Matching Columns)
// 6. short-answer (Direct Typed Answer with Smart Match)

const quizTopics = [
  {
    id: "parts-of-speech",
    title: "Parts of Speech",
    description: "Master Nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions, Conjunctions & Interjections.",
    iconClass: "fa-solid fa-shapes",
    color: "pink",
    questions: [
      // --- BEGINNER ---
      {
        id: "pos_b_1",
        difficulty: "beginner",
        type: "mcq",
        questionText: "Identify the part of speech of the highlighted word:",
        sentence: "Maria <mark class='target-word'>runs</mark> enthusiastically in the school park every morning.",
        targetWord: "runs",
        options: ["Action Verb", "Proper Noun", "Adjective", "Preposition"],
        correctAnswer: 0,
        feedback: {
          rule: "Action verbs express physical or mental actions performed by the subject.",
          example: "'Maria runs' — 'runs' tells what Maria is physically doing.",
          tip: "Ask: Can you do this action? If yes, it's an action verb!"
        }
      },
      {
        id: "pos_b_2",
        difficulty: "beginner",
        type: "fill-blank",
        questionText: "Choose the correct pronoun to complete the sentence:",
        sentence: "David forgot _____ textbook in the science laboratory.",
        options: ["his", "him", "he", "their"],
        correctAnswer: "his",
        feedback: {
          rule: "Possessive adjectives (his, her, their) show ownership over a following noun ('textbook').",
          example: "David forgot his notebook.",
          tip: "Use 'his' before a noun to denote singular masculine possession."
        }
      },
      {
        id: "pos_b_3",
        difficulty: "beginner",
        type: "true-false",
        questionText: "Determine if this grammar rule statement is True or False:",
        sentence: "An adjective is a word that modifies or describes a noun or pronoun.",
        correctAnswer: true,
        feedback: {
          rule: "Adjectives provide descriptive details (size, color, quality) about nouns.",
          example: "'The energetic puppy barked.' -> 'energetic' modifies 'puppy'.",
          tip: "Adjectives answer: What kind? Which one? How many?"
        }
      },
      {
        id: "pos_b_4",
        difficulty: "beginner",
        type: "short-answer",
        questionText: "Type the adjective found in the following sentence:",
        sentence: "The brilliant student solved the complex equation in seconds.",
        acceptableAnswers: ["brilliant", "complex"],
        correctAnswer: "brilliant",
        feedback: {
          rule: "Words like 'brilliant' and 'complex' describe qualities of the nouns 'student' and 'equation'.",
          example: "'Brilliant student' and 'complex equation' both pair adjectives with nouns.",
          tip: "Look for words placed directly before nouns that describe their characteristics."
        }
      },
      {
        id: "pos_b_5",
        difficulty: "beginner",
        type: "matching",
        questionText: "Match each target word with its correct part of speech:",
        sentence: "Connect the words on the left with their grammatical classification on the right.",
        pairs: [
          { left: "Joyfulness", right: "Abstract Noun" },
          { left: "Swiftly", right: "Adverb of Manner" },
          { left: "Underneath", right: "Preposition" },
          { left: "Ouch!", right: "Interjection" }
        ],
        feedback: {
          rule: "Words carry distinct roles: naming concepts (Noun), modifying verbs (Adverb), indicating position (Preposition), or expressing emotion (Interjection).",
          example: "Ouch! (Interjection) She ran swiftly (Adverb) underneath (Preposition) the shelter.",
          tip: "Look at suffixes: '-ness' often marks nouns, while '-ly' often signals adverbs."
        }
      },

      // --- INTERMEDIATE ---
      {
        id: "pos_i_1",
        difficulty: "intermediate",
        type: "mcq",
        questionText: "What type of pronoun is the highlighted word?",
        sentence: "The research paper <mark class='target-word'>which</mark> was published last week won an award.",
        targetWord: "which",
        options: ["Relative Pronoun", "Demonstrative Pronoun", "Interrogative Pronoun", "Indefinite Pronoun"],
        correctAnswer: 0,
        feedback: {
          rule: "Relative pronouns (who, whom, whose, which, that) introduce relative clauses that provide extra detail about a noun.",
          example: "The laptop which I bought yesterday is fast.",
          tip: "'Which' connects a noun to a clause modifying it."
        }
      },
      {
        id: "pos_i_2",
        difficulty: "intermediate",
        type: "sentence-correction",
        questionText: "Identify the part of speech error in the sentence and choose the correction:",
        sentence: "She performed very good during the national debate tournament.",
        options: [
          "Change 'good' (adjective) to 'well' (adverb of manner)",
          "Change 'performed' to 'performing'",
          "Change 'during' to 'at'",
          "No correction needed"
        ],
        correctAnswer: 0,
        feedback: {
          rule: "'Good' is an adjective, whereas 'well' is an adverb modifying the action verb 'performed'.",
          example: "She sings well (adverb). Her voice is good (adjective).",
          tip: "Modify action verbs with 'well', not 'good'!"
        }
      },
      {
        id: "pos_i_3",
        difficulty: "intermediate",
        type: "fill-blank",
        questionText: "Select the correlative conjunction pair to complete the thought:",
        sentence: "_____ the professor _____ the assistant was able to locate the archive.",
        options: ["Neither... nor", "Either... and", "Both... or", "Not only... and"],
        correctAnswer: "Neither... nor",
        feedback: {
          rule: "Correlative conjunctions work in fixed pairs: 'Neither... nor', 'Either... or', 'Not only... but also'.",
          example: "Neither rain nor storm stopped the marathon.",
          tip: "Pair 'Neither' exclusively with 'Nor'!"
        }
      },
      {
        id: "pos_i_4",
        difficulty: "intermediate",
        type: "short-answer",
        questionText: "Type the preposition in the following sentence:",
        sentence: "The laboratory instruments are stored amidst the glass containers.",
        acceptableAnswers: ["amidst", "in"],
        correctAnswer: "amidst",
        feedback: {
          rule: "'Amidst' is a preposition meaning 'in the middle of' or 'surrounded by'.",
          example: "She felt calm amidst the chaos.",
          tip: "Prepositions establish spatial, temporal, or logical relationships."
        }
      },

      // --- ADVANCED ---
      {
        id: "pos_a_1",
        difficulty: "advanced",
        type: "mcq",
        questionText: "Determine the exact grammatical function of the highlighted word:",
        sentence: "Her <mark class='target-word'>tireless</mark> dedication to marine biology earned international acclaim.",
        targetWord: "tireless",
        options: ["Attributive Adjective", "Predicate Adjective", "Adverb of Degree", "Gerund"],
        correctAnswer: 0,
        feedback: {
          rule: "An Attributive Adjective directly precedes the noun it modifies ('tireless dedication'), whereas a Predicate Adjective follows a linking verb.",
          example: "Attributive: 'tireless worker' vs Predicate: 'the worker is tireless'.",
          tip: "Before the noun = Attributive. After a linking verb = Predicate adjective."
        }
      },
      {
        id: "pos_a_2",
        difficulty: "advanced",
        type: "true-false",
        questionText: "Is this advanced linguistic statement True or False?",
        sentence: "In 'Indubitably, the hypothesis holds merit', 'Indubitably' acts as a sentence adverb modifying the entire proposition.",
        correctAnswer: true,
        feedback: {
          rule: "Sentence adverbs modify an entire clause or sentence rather than a single verb or adjective.",
          example: "'Undoubtedly, the results are valid.'",
          tip: "Introductory adverbs set off by a comma usually modify the whole sentence stance."
        }
      }
    ]
  },

  {
    id: "subject-verb-agreement",
    title: "Subject-Verb Agreement",
    description: "Conquer singular & plural subjects, intervening prepositional phrases, collective nouns, and compound rules.",
    iconClass: "fa-solid fa-scale-balanced",
    color: "rose",
    questions: [
      // --- BEGINNER ---
      {
        id: "sva_b_1",
        difficulty: "beginner",
        type: "mcq",
        questionText: "Choose the correct verb form for the singular subject:",
        sentence: "The diligent student _____ to the library every single afternoon.",
        options: ["walks", "walk", "walking", "are walking"],
        correctAnswer: 0,
        feedback: {
          rule: "A third-person singular subject ('student') takes a singular verb ending in -s ('walks').",
          example: "The student walks. The students walk.",
          tip: "Singular nouns usually don't have -s, so their present tense verbs DO take -s!"
        }
      },
      {
        id: "sva_b_2",
        difficulty: "beginner",
        type: "true-false",
        questionText: "Is the following statement correct?",
        sentence: "'The dogs is barking loudly in the backyard.'",
        correctAnswer: false,
        feedback: {
          rule: "'Dogs' is plural, so it requires the plural helping verb 'are', not singular 'is'.",
          example: "The dogs are barking loudly.",
          tip: "Plural subject -> Plural verb ('are'/'were')."
        }
      },
      {
        id: "sva_b_3",
        difficulty: "beginner",
        type: "fill-blank",
        questionText: "Fill in the blank with the correct verb:",
        sentence: "Both Maria and Lucas _____ attending the university seminar today.",
        options: ["are", "is", "was", "has been"],
        correctAnswer: "are",
        feedback: {
          rule: "Compound subjects joined by 'and' represent multiple entities and take a plural verb ('are').",
          example: "Tom and Jerry are famous characters.",
          tip: "'X and Y' = They = Plural verb."
        }
      },
      {
        id: "sva_b_4",
        difficulty: "beginner",
        type: "short-answer",
        questionText: "Type the correct form of the verb 'to be' (is/are) for this sentence:",
        sentence: "The box of chocolate cookies _____ on the kitchen counter.",
        acceptableAnswers: ["is"],
        correctAnswer: "is",
        feedback: {
          rule: "The true subject is 'box' (singular). The prepositional phrase 'of chocolate cookies' does not alter the singular subject.",
          example: "The bouquet of roses is lovely.",
          tip: "Cross out prepositional phrases starting with 'of', 'in', or 'with' to find the real subject!"
        }
      },

      // --- INTERMEDIATE ---
      {
        id: "sva_i_1",
        difficulty: "intermediate",
        type: "mcq",
        questionText: "Select the verb that correctly agrees with the subject:",
        sentence: "The list of approved survey questions, along with the guidelines, _____ ready.",
        options: ["is", "are", "were", "have been"],
        correctAnswer: 0,
        feedback: {
          rule: "Parenthetical phrases like 'along with', 'as well as', and 'together with' do not change the number of the main subject ('list' is singular).",
          example: "The president, accompanied by his advisors, is speaking now.",
          tip: "Ignore everything between commas introduced by 'along with' when checking agreement."
        }
      },
      {
        id: "sva_i_2",
        difficulty: "intermediate",
        type: "sentence-correction",
        questionText: "Find the grammatical flaw and choose the corrected sentence:",
        sentence: "Neither the teacher nor the students was prepared for the fire drill.",
        options: [
          "Neither the teacher nor the students were prepared for the fire drill.",
          "Neither the teacher nor the students is prepared for the fire drill.",
          "Neither the teacher or the students was prepared for the fire drill.",
          "The sentence is already correct."
        ],
        correctAnswer: 0,
        feedback: {
          rule: "With 'Neither... nor', the verb must agree with the subject closest to it ('students' is plural, requiring 'were').",
          example: "Neither the captain nor the crew members were afraid.",
          tip: "Proximity Rule: The closest subject to the verb decides singular or plural!"
        }
      },
      {
        id: "sva_i_3",
        difficulty: "intermediate",
        type: "matching",
        questionText: "Match the subject phrase with its required verb number:",
        sentence: "Pair each subject pattern on the left with its correct agreement rule on the right.",
        pairs: [
          { left: "Every student and mentor", right: "Requires Singular Verb" },
          { left: "The team members individually", right: "Requires Plural Verb" },
          { left: "Physics as a subject", right: "Requires Singular Verb" },
          { left: "A number of qualitative studies", right: "Requires Plural Verb" }
        ],
        feedback: {
          rule: "'Every' always enforces singular; 'A number of' is plural; subjects ending in -s like 'Physics' are singular disciplines.",
          example: "Every student is present. A number of tests were run.",
          tip: "'A number of' = Plural; 'The number of' = Singular."
        }
      },

      // --- ADVANCED ---
      {
        id: "sva_a_1",
        difficulty: "advanced",
        type: "mcq",
        questionText: "Select the grammatically impeccable verb:",
        sentence: "She is one of those dedicated scholars who _____ constantly pushing the boundaries of science.",
        options: ["are", "is", "was", "has been"],
        correctAnswer: 0,
        feedback: {
          rule: "In the construction 'one of those [plural noun] who', the relative pronoun 'who' refers to the plural noun ('scholars'), so it takes a plural verb ('are').",
          example: "He is one of those authors who write compelling mysteries.",
          tip: "Unless preceded by 'the only one of', 'one of those who' takes a plural verb!"
        }
      },
      {
        id: "sva_a_2",
        difficulty: "advanced",
        type: "fill-blank",
        questionText: "Choose the verb that conforms to standard measurement agreement:",
        sentence: "Ten kilometers _____ an exhausting distance to sprint without adequate preparation.",
        options: ["is", "are", "were", "seem"],
        correctAnswer: "is",
        feedback: {
          rule: "Units of measurement, periods of time, and sums of money are viewed as single collective units and take singular verbs.",
          example: "Fifty dollars is too expensive for that book.",
          tip: "Treat total distances or amounts as a singular unit."
        }
      }
    ]
  },

  {
    id: "verb-tenses",
    title: "Verb Tenses",
    description: "Explore Simple, Continuous, Perfect, and Perfect Continuous across Past, Present, and Future.",
    iconClass: "fa-solid fa-clock-rotate-left",
    color: "fuchsia",
    questions: [
      // --- BEGINNER ---
      {
        id: "vt_b_1",
        difficulty: "beginner",
        type: "mcq",
        questionText: "Identify the tense of the highlighted verb:",
        sentence: "The research team <mark class='target-word'>is analyzing</mark> the latest data right now.",
        targetWord: "is analyzing",
        options: ["Present Continuous", "Simple Present", "Past Continuous", "Present Perfect"],
        correctAnswer: 0,
        feedback: {
          rule: "Present Continuous (is/are + verb-ing) indicates an action currently happening at the moment of speech.",
          example: "She is writing a letter right now.",
          tip: "Look for 'is/are' + verb ending in '-ing' + time cues like 'right now'."
        }
      },
      {
        id: "vt_b_2",
        difficulty: "beginner",
        type: "true-false",
        questionText: "Is this tense statement True or False?",
        sentence: "'Water boils at 100 degrees Celsius' uses the Simple Present tense for a universal scientific truth.",
        correctAnswer: true,
        feedback: {
          rule: "Simple Present is used for universal truths, scientific laws, habits, and permanent states.",
          example: "The sun rises in the east.",
          tip: "Scientific facts and repeated habits = Simple Present!"
        }
      },
      {
        id: "vt_b_3",
        difficulty: "beginner",
        type: "fill-blank",
        questionText: "Choose the correct past tense form:",
        sentence: "Yesterday, the chemist _____ three separate trials in the laboratory.",
        options: ["conducted", "conducts", "is conducting", "will conduct"],
        correctAnswer: "conducted",
        feedback: {
          rule: "Simple Past (-ed or irregular past) is used for actions completed at a specific past time.",
          example: "Yesterday we visited the museum.",
          tip: "Time markers like 'yesterday', 'in 2020', or 'last week' signal Simple Past."
        }
      },
      {
        id: "vt_b_4",
        difficulty: "beginner",
        type: "short-answer",
        questionText: "Type the future tense auxiliary verb that completes: 'We _____ submit the report tomorrow.'",
        sentence: "We _____ submit the report tomorrow.",
        acceptableAnswers: ["will", "shall"],
        correctAnswer: "will",
        feedback: {
          rule: "Simple Future uses modal auxiliary 'will' + base verb to express future intentions or events.",
          example: "I will call you tomorrow.",
          tip: "'Will' + base verb = Simple Future."
        }
      },

      // --- INTERMEDIATE ---
      {
        id: "vt_i_1",
        difficulty: "intermediate",
        type: "mcq",
        questionText: "Identify the tense used in the sentence:",
        sentence: "The historians <mark class='target-word'>have published</mark> their findings across several journals.",
        targetWord: "have published",
        options: ["Present Perfect", "Past Perfect", "Past Simple", "Future Perfect"],
        correctAnswer: 0,
        feedback: {
          rule: "Present Perfect (have/has + past participle) connects past actions to the present, focusing on the result or lifetime experience.",
          example: "I have visited Tokyo twice.",
          tip: "Formula: have/has + past participle (V3)."
        }
      },
      {
        id: "vt_i_2",
        difficulty: "intermediate",
        type: "sentence-correction",
        questionText: "Identify the tense sequence error and choose the correction:",
        sentence: "When the power failed, the scientists are running a critical calibration.",
        options: [
          "Change 'are running' to 'were running' (Past Continuous)",
          "Change 'failed' to 'fails'",
          "Change 'are running' to 'have run'",
          "No correction needed"
        ],
        correctAnswer: 0,
        feedback: {
          rule: "When an ongoing past activity is interrupted by a completed past event ('failed'), use Past Continuous (were running).",
          example: "While I was studying, the doorbell rang.",
          tip: "Past ongoing background action = was/were + verb-ing."
        }
      },
      {
        id: "vt_i_3",
        difficulty: "intermediate",
        type: "matching",
        questionText: "Match each sentence with its correct grammatical tense:",
        sentence: "Match the example sentences with their corresponding tense labels.",
        pairs: [
          { left: "She had finalized the report before noon.", right: "Past Perfect" },
          { left: "They have been studying for hours.", right: "Present Perfect Continuous" },
          { left: "He will be presenting at 3 PM.", right: "Future Continuous" },
          { left: "The sun rises in the east.", right: "Simple Present" }
        ],
        feedback: {
          rule: "Tenses combine time (Past/Present/Future) and aspect (Simple/Continuous/Perfect/Perfect Continuous).",
          example: "Had + V3 = Past Perfect; Have been + V-ing = Present Perfect Continuous.",
          tip: "'Had' is the past of 'have' -> Past Perfect!"
        }
      },

      // --- ADVANCED ---
      {
        id: "vt_a_1",
        difficulty: "advanced",
        type: "mcq",
        questionText: "Identify the tense and aspect of the highlighted verb phrase:",
        sentence: "By December, the research team <mark class='target-word'>will have been tracking</mark> migratory patterns for a decade.",
        targetWord: "will have been tracking",
        options: [
          "Future Perfect Continuous",
          "Future Continuous",
          "Present Perfect Continuous",
          "Future Perfect Simple"
        ],
        correctAnswer: 0,
        feedback: {
          rule: "Future Perfect Continuous (will have been + verb-ing) highlights the duration of an ongoing activity up to a specific point in the future.",
          example: "By next year, I will have been teaching here for 5 years.",
          tip: "Formula: will + have + been + [verb]-ing + 'by [future time]'."
        }
      },
      {
        id: "vt_a_2",
        difficulty: "advanced",
        type: "fill-blank",
        questionText: "Select the correct Past Perfect verb to denote the earlier of two past actions:",
        sentence: "The defense committee _____ the proposal before the candidate arrived.",
        options: ["had reviewed", "has reviewed", "was reviewing", "will review"],
        correctAnswer: "had reviewed",
        feedback: {
          rule: "Past Perfect (had + past participle) shows that an event took place before another past action ('arrived').",
          example: "The train had left before we reached the station.",
          tip: "The earlier past action takes 'had + past participle'!"
        }
      }
    ]
  },

  {
    id: "sentence-correction-mechanics",
    title: "Sentence Correction & Mechanics",
    description: "Spot run-ons, comma splices, misplaced modifiers, faulty parallelism, and punctuation slips.",
    iconClass: "fa-solid fa-wand-magic-sparkles",
    color: "amber",
    questions: [
      // --- BEGINNER ---
      {
        id: "scm_b_1",
        difficulty: "beginner",
        type: "sentence-correction",
        questionText: "Fix the capitalization and punctuation in this sentence:",
        sentence: "she enjoys reading novels writing poetry and painted landscapes",
        options: [
          "She enjoys reading novels, writing poetry, and painting landscapes.",
          "she enjoys reading novels writing poetry and painted landscapes.",
          "She enjoys reading novels, write poetry, and paint landscapes.",
          "She enjoys reading novels, writing poetry, and painted landscapes."
        ],
        correctAnswer: 0,
        feedback: {
          rule: "Parallel structure requires items in a list to use the same grammatical form (reading, writing, painting). Sentences must begin with a capital letter and end with a period.",
          example: "I like swimming, hiking, and camping.",
          tip: "Keep all listed items in the exact same grammatical shape (all -ing verbs)!"
        }
      },
      {
        id: "scm_b_2",
        difficulty: "beginner",
        type: "true-false",
        questionText: "Is this sentence a comma splice error?",
        sentence: "'I studied hard for the quiz, I got an excellent score.'",
        correctAnswer: true,
        feedback: {
          rule: "A comma splice occurs when two independent clauses are joined with only a comma. Use a coordinating conjunction (and, so) or a semicolon.",
          example: "Correct: 'I studied hard for the quiz, so I got an excellent score.'",
          tip: "Never join two complete standalone sentences with just a lonely comma!"
        }
      },
      {
        id: "scm_b_3",
        difficulty: "beginner",
        type: "fill-blank",
        questionText: "Choose the correct coordinating conjunction to fix the run-on sentence:",
        sentence: "The weather was stormy, _____ the brave explorers continued their journey.",
        options: ["yet", "because", "unless", "since"],
        correctAnswer: "yet",
        feedback: {
          rule: "'Yet' or 'but' is a coordinating conjunction used with a comma to join contrasting independent clauses.",
          example: "It was raining, yet we went to the beach.",
          tip: "Remember the FANBOYS conjunctions: For, And, Nor, But, Or, Yet, So."
        }
      },

      // --- INTERMEDIATE ---
      {
        id: "scm_i_1",
        difficulty: "intermediate",
        type: "sentence-correction",
        questionText: "Fix the misplaced modifier in this sentence:",
        sentence: "Barking frantically at the squirrel, the mail carrier was startled by the dog.",
        options: [
          "The dog, barking frantically at the squirrel, startled the mail carrier.",
          "Barking frantically at the squirrel, the mail carrier startled the dog.",
          "The mail carrier was barking frantically at the squirrel by the dog.",
          "The sentence is already free of modifier errors."
        ],
        correctAnswer: 0,
        feedback: {
          rule: "A modifier must be placed as close as possible to the word it describes. The dog was barking, not the mail carrier.",
          example: "Covered in chocolate, the cake was devoured by the children.",
          tip: "Ask: Who is actually performing the introductory action?"
        }
      },
      {
        id: "scm_i_2",
        difficulty: "intermediate",
        type: "matching",
        questionText: "Match each sentence error term with its proper grammatical fix:",
        sentence: "Pair each structural error on the left with the correct remedy on the right.",
        pairs: [
          { left: "Comma Splice", right: "Add a semicolon or comma + FANBOYS" },
          { left: "Dangling Modifier", right: "State the logical subject immediately after the phrase" },
          { left: "Faulty Parallelism", right: "Match verb forms across all list items" },
          { left: "Sentence Fragment", right: "Add missing subject or finite verb" }
        ],
        feedback: {
          rule: "Sentence mechanics ensure clarity and avoid common syntactic flaws.",
          example: "Semicolons fix comma splices; keeping verb forms uniform fixes parallelism.",
          tip: "Always ensure every sentence has a complete subject and predicate."
        }
      },

      // --- ADVANCED ---
      {
        id: "scm_a_1",
        difficulty: "advanced",
        type: "mcq",
        questionText: "Select the sentence with flawless grammatical parallelism and punctuation:",
        sentence: "Which of the following sentences is fully correct?",
        options: [
          "The director insisted that the report be concise, that the data be verified, and that the conclusion be actionable.",
          "The director insisted on a concise report, to verify the data, and making the conclusion actionable.",
          "The director insisted that the report is concise, the data verified, and actionable conclusions.",
          "The director insisted that the report be concise, the data is verified, and that the conclusion is actionable."
        ],
        correctAnswer: 0,
        feedback: {
          rule: "Subjunctive parallelism repeats the 'that [noun] be [adjective]' structure consistently across all three clauses.",
          example: "We requested that he come on time, that he bring the notes, and that he remain quiet.",
          tip: "Repeat structural conjunctions ('that... that... that...') for clean parallel rhythm."
        }
      }
    ]
  }
];
