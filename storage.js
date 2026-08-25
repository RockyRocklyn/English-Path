// Data Persistence & Analytics Layer for The English Path

class StorageManager {
  constructor() {
    this.KEYS = {
      USER: 'englishPath_user',
      TOPIC_PROGRESS: 'englishPath_topic_progress',
      HISTORY: 'englishPath_history',
      REVIEWERS: 'englishPath_reviewers'
    };
    this.initDefaults();
  }

  // Initialize default data if not present
  initDefaults() {
    if (!localStorage.getItem(this.KEYS.USER)) {
      const defaultUser = {
        name: 'Learner',
        avatar: '🌸',
        xp: 0,
        streakCount: 1,
        bestStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        joinedDate: new Date().toISOString()
      };
      this.saveUser(defaultUser);
    } else {
      this.checkDailyStreak();
    }

    if (!localStorage.getItem(this.KEYS.TOPIC_PROGRESS)) {
      localStorage.setItem(this.KEYS.TOPIC_PROGRESS, JSON.stringify({}));
    }

    if (!localStorage.getItem(this.KEYS.HISTORY)) {
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify([]));
    }

    if (!localStorage.getItem(this.KEYS.REVIEWERS)) {
      const defaultReviewers = [
        {
          id: 'rev_starter_1',
          title: 'Essential Nouns & Verbs Guide',
          topic: 'Parts of Speech',
          notes: 'Nouns name things, people, places, or ideas. Action verbs express physical or mental actions.',
          definitions: [
            { term: 'Abstract Noun', definition: 'A noun denoting an idea, quality, or state rather than a concrete object (e.g., courage, freedom).' },
            { term: 'Transitive Verb', definition: 'A verb that requires a direct object to complete its meaning (e.g., she wrote a letter).' }
          ],
          reminders: [
            'Abstract nouns cannot be touched physically.',
            'Always check if a verb transfers action to a direct object.'
          ],
          customQuestions: [
            {
              id: 'cq_1',
              type: 'mcq',
              questionText: 'Which word is an abstract noun?',
              sentence: 'Her dedication led to remarkable scientific breakthroughs.',
              options: ['Dedication', 'Scientific', 'Breakthroughs', 'Her'],
              correctAnswer: 0,
              feedback: {
                rule: 'Abstract nouns represent intangible concepts, ideas, or feelings.',
                example: 'Kindness, dedication, and wisdom are abstract nouns.',
                tip: 'If you cannot touch it with your hands, it is likely an abstract noun!'
              }
            },
            {
              id: 'cq_2',
              type: 'true-false',
              questionText: 'Is this statement true or false?',
              sentence: 'Transitive verbs do NOT take any direct objects.',
              correctAnswer: false,
              feedback: {
                rule: 'Transitive verbs always require one or more direct objects.',
                example: 'In "She reads novels", "novels" is the direct object of the transitive verb "reads".',
                tip: 'Think: Transitive = Transfers action to an object.'
              }
            }
          ]
        }
      ];
      localStorage.setItem(this.KEYS.REVIEWERS, JSON.stringify(defaultReviewers));
    }
  }

  // Get current user profile
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.USER)) || {
        name: 'Learner',
        avatar: '🌸',
        xp: 0,
        streakCount: 1,
        bestStreak: 1
      };
    } catch (e) {
      return { name: 'Learner', avatar: '🌸', xp: 0, streakCount: 1, bestStreak: 1 };
    }
  }

  // Save user profile
  saveUser(user) {
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  }

  // Update user name and avatar
  updateProfile(name, avatar) {
    const user = this.getUser();
    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    this.saveUser(user);
    return user;
  }

  // Add experience points and check level
  addXP(amount) {
    const user = this.getUser();
    user.xp = (user.xp || 0) + amount;
    this.saveUser(user);
    return user.xp;
  }

  // Daily streak check
  checkDailyStreak() {
    const user = this.getUser();
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActiveDate;

    if (!lastActive) {
      user.lastActiveDate = today;
      user.streakCount = 1;
      this.saveUser(user);
      return;
    }

    if (lastActive === today) {
      // Already active today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      // Studied yesterday, increment streak
      user.streakCount = (user.streakCount || 0) + 1;
      if (user.streakCount > (user.bestStreak || 0)) {
        user.bestStreak = user.streakCount;
      }
    } else {
      // Missed more than 1 day, reset streak to 1
      user.streakCount = 1;
    }

    user.lastActiveDate = today;
    this.saveUser(user);
  }

  // Record a completed quiz attempt and update progress
  recordQuizAttempt(attemptData) {
    const {
      topicId,
      topicTitle,
      difficulty,
      score,
      totalQuestions,
      correctCount,
      accuracy,
      mistakes
    } = attemptData;

    // 1. Log to history
    const history = this.getHistory();
    const newRecord = {
      id: 'quiz_' + Date.now(),
      timestamp: new Date().toISOString(),
      topicId,
      topicTitle,
      difficulty: difficulty || 'standard',
      score,
      totalQuestions,
      correctCount,
      accuracy,
      mistakes: mistakes || []
    };
    history.unshift(newRecord);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history.slice(0, 100))); // keep latest 100

    // 2. Update Topic Progress
    const progressMap = this.getTopicProgress();
    const current = progressMap[topicId] || {
      attempted: 0,
      correct: 0,
      accuracy: 0,
      completedQuizzes: 0,
      lastPlayed: null
    };

    current.attempted += totalQuestions;
    current.correct += correctCount;
    current.accuracy = Math.round((current.correct / current.attempted) * 100);
    current.completedQuizzes += 1;
    current.lastPlayed = new Date().toISOString();
    
    // Determine mastery
    if (current.accuracy >= 85 && current.completedQuizzes >= 2) {
      current.mastery = 'Master';
    } else if (current.accuracy >= 70) {
      current.mastery = 'Proficient';
    } else {
      current.mastery = 'Needs Practice';
    }

    progressMap[topicId] = current;
    localStorage.setItem(this.KEYS.TOPIC_PROGRESS, JSON.stringify(progressMap));

    // 3. Add XP based on score & accuracy
    const earnedXP = score + Math.round(accuracy / 2);
    this.addXP(earnedXP);

    // 4. Update streak
    this.checkDailyStreak();

    return { record: newRecord, earnedXP };
  }

  // Get topic progress map
  getTopicProgress() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.TOPIC_PROGRESS)) || {};
    } catch (e) {
      return {};
    }
  }

  // Get full quiz history
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.HISTORY)) || [];
    } catch (e) {
      return [];
    }
  }

  // Get all custom reviewers
  getReviewers() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.REVIEWERS)) || [];
    } catch (e) {
      return [];
    }
  }

  // Get specific reviewer by ID
  getReviewerById(id) {
    const reviewers = this.getReviewers();
    return reviewers.find(r => r.id === id) || null;
  }

  // Save or update custom reviewer
  saveReviewer(reviewer) {
    const reviewers = this.getReviewers();
    const existingIndex = reviewers.findIndex(r => r.id === reviewer.id);

    if (existingIndex >= 0) {
      reviewers[existingIndex] = reviewer;
    } else {
      reviewers.unshift(reviewer);
    }

    localStorage.setItem(this.KEYS.REVIEWERS, JSON.stringify(reviewers));
    return reviewer;
  }

  // Delete reviewer
  deleteReviewer(id) {
    let reviewers = this.getReviewers();
    reviewers = reviewers.filter(r => r.id !== id);
    localStorage.setItem(this.KEYS.REVIEWERS, JSON.stringify(reviewers));
    return reviewers;
  }

  // Generate smart recommendations based on weakest topics or unplayed topics
  getSmartRecommendations(builtInTopics) {
    const progress = this.getTopicProgress();
    const recommendations = [];

    builtInTopics.forEach(topic => {
      const prog = progress[topic.id];
      if (!prog || prog.completedQuizzes === 0) {
        recommendations.push({
          topicId: topic.id,
          title: topic.title,
          iconClass: topic.iconClass,
          color: topic.color,
          reason: 'Unexplored Path',
          message: 'You have not taken this quiz yet! Start here to test your foundation.',
          priority: 1
        });
      } else if (prog.accuracy < 70) {
        recommendations.push({
          topicId: topic.id,
          title: topic.title,
          iconClass: topic.iconClass,
          color: topic.color,
          reason: 'Needs Improvement',
          message: `Current accuracy is ${prog.accuracy}%. Try reviewing this topic to boost mastery!`,
          priority: 3
        });
      } else if (prog.accuracy < 85) {
        recommendations.push({
          topicId: topic.id,
          title: topic.title,
          iconClass: topic.iconClass,
          color: topic.color,
          reason: 'Level Up to Master',
          message: `Accuracy is ${prog.accuracy}%. One more strong attempt will achieve Master rank!`,
          priority: 2
        });
      }
    });

    // Sort by priority (higher priority first)
    recommendations.sort((a, b) => b.priority - a.priority);
    return recommendations;
  }

  // Reset all user data
  resetAll() {
    localStorage.removeItem(this.KEYS.USER);
    localStorage.removeItem(this.KEYS.TOPIC_PROGRESS);
    localStorage.removeItem(this.KEYS.HISTORY);
    localStorage.removeItem(this.KEYS.REVIEWERS);
    this.initDefaults();
  }
}

// Global Storage instance
const storage = new StorageManager();
