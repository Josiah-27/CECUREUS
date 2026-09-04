/**
 * Migration 010 — Seed Data
 *
 * Populates the database with initial counsellors and assessments
 * matching the CECUREUS Figma prototype.
 */

const { v4: uuidv4 } = require('uuid');

exports.up = async function (conn) {
  // ── SEED COUNSELLORS ─────────────────────────────────────
  const counsellors = [
    {
      id: uuidv4(),
      name: 'Dr. Neha Sharma',
      title: 'Clinical Psychologist',
      specializations: JSON.stringify(['Anxiety', 'Stress', 'Depression', 'Trauma']),
      experience_years: 8,
      rating: 4.9,
      total_sessions: 412,
      languages: JSON.stringify(['English', 'Hindi']),
      bio: 'Dr. Neha Sharma is a licensed clinical psychologist with over 8 years of experience specializing in anxiety disorders, stress management, depression, and trauma recovery. She uses evidence-based approaches including CBT, EMDR, and mindfulness-based interventions to help clients achieve lasting well-being.',
      is_verified: 1,
      is_available: 1,
    },
    {
      id: uuidv4(),
      name: 'Mr. Rohan Verma',
      title: 'Counselling Psychologist',
      specializations: JSON.stringify(['Stress', 'Work Stress', 'Anxiety', 'Career']),
      experience_years: 6,
      rating: 4.8,
      total_sessions: 298,
      languages: JSON.stringify(['English', 'Hindi', 'Marathi']),
      bio: 'Mr. Rohan Verma specializes in workplace stress, career-related anxiety, and professional burnout. With 6 years of experience in corporate mental health, he brings a practical, solution-focused approach to counselling sessions.',
      is_verified: 1,
      is_available: 1,
    },
    {
      id: uuidv4(),
      name: 'Dr. Ayesha Khan',
      title: 'Psychiatrist',
      specializations: JSON.stringify(['Depression', 'Bipolar Disorder', 'Sleep Disorders', 'OCD']),
      experience_years: 12,
      rating: 4.9,
      total_sessions: 687,
      languages: JSON.stringify(['English', 'Hindi', 'Urdu']),
      bio: 'Dr. Ayesha Khan is a board-certified psychiatrist with 12 years of clinical experience. She takes an integrated approach combining pharmacological treatment with psychotherapy, specializing in mood disorders, sleep disturbances, and obsessive-compulsive disorder.',
      is_verified: 1,
      is_available: 1,
    },
    {
      id: uuidv4(),
      name: 'Ms. Priya Menon',
      title: 'Psychotherapist',
      specializations: JSON.stringify(['Relationship Issues', 'Self Esteem', 'Grief', 'Anxiety']),
      experience_years: 5,
      rating: 4.7,
      total_sessions: 189,
      languages: JSON.stringify(['English', 'Malayalam', 'Tamil']),
      bio: 'Ms. Priya Menon is a licensed psychotherapist specializing in relationship dynamics, self-esteem building, and grief counselling. She uses a warm, client-centered approach to create a safe space for personal growth and healing.',
      is_verified: 1,
      is_available: 1,
    },
    {
      id: uuidv4(),
      name: 'Dr. Arjun Patel',
      title: 'Clinical Psychologist',
      specializations: JSON.stringify(['Addiction', 'Anger Management', 'Depression', 'PTSD']),
      experience_years: 10,
      rating: 4.8,
      total_sessions: 534,
      languages: JSON.stringify(['English', 'Gujarati', 'Hindi']),
      bio: 'Dr. Arjun Patel is a clinical psychologist with a decade of experience in addiction recovery, anger management, and trauma-focused therapy. He combines CBT with motivational interviewing techniques for effective long-term recovery.',
      is_verified: 1,
      is_available: 1,
    },
  ];

  for (const c of counsellors) {
    await conn.execute(
      `INSERT INTO counsellors (id, name, title, specializations, experience_years, rating, total_sessions, languages, bio, is_verified, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.title, c.specializations, c.experience_years, c.rating, c.total_sessions, c.languages, c.bio, c.is_verified, c.is_available]
    );
  }

  // ── SEED ASSESSMENTS ─────────────────────────────────────
  const assessments = [
    {
      id: uuidv4(),
      title: 'Stress Level Check',
      description: 'Find out your stress levels',
      category: 'stress',
      duration_minutes: 5,
      questions: JSON.stringify([
        { id: 1, text: 'How often have you felt nervous or stressed in the past month?', options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'] },
        { id: 2, text: 'How often have you felt that you were unable to control important things in your life?', options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'] },
        { id: 3, text: 'How often have you felt confident about handling personal problems?', options: ['Very Often', 'Fairly Often', 'Sometimes', 'Almost Never', 'Never'] },
        { id: 4, text: 'How often have you felt that things were going your way?', options: ['Very Often', 'Fairly Often', 'Sometimes', 'Almost Never', 'Never'] },
        { id: 5, text: 'How often have you found that you could not cope with all the things you had to do?', options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'] },
      ]),
    },
    {
      id: uuidv4(),
      title: 'Burnout Assessment',
      description: "Check if you're experiencing burnout",
      category: 'burnout',
      duration_minutes: 7,
      questions: JSON.stringify([
        { id: 1, text: 'I feel emotionally drained from my work.', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
        { id: 2, text: 'I feel used up at the end of the workday.', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
        { id: 3, text: 'I feel fatigued when I get up in the morning and have to face another day on the job.', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
        { id: 4, text: 'Working with people all day is really a strain for me.', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
        { id: 5, text: 'I feel burned out from my work.', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
        { id: 6, text: 'I feel frustrated by my job.', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
      ]),
    },
    {
      id: uuidv4(),
      title: 'Anxiety Screening',
      description: 'Screen your anxiety levels',
      category: 'anxiety',
      duration_minutes: 5,
      questions: JSON.stringify([
        { id: 1, text: 'Over the last 2 weeks, how often have you been feeling nervous, anxious, or on edge?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
        { id: 2, text: 'How often have you been unable to stop or control worrying?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
        { id: 3, text: 'How often have you been worrying too much about different things?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
        { id: 4, text: 'How often have you had trouble relaxing?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
        { id: 5, text: 'How often have you been so restless that it is hard to sit still?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      ]),
    },
    {
      id: uuidv4(),
      title: 'Work-Life Balance Score',
      description: 'Evaluate your work life balance',
      category: 'work_life',
      duration_minutes: 6,
      questions: JSON.stringify([
        { id: 1, text: 'I am able to maintain a healthy boundary between work and personal life.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
        { id: 2, text: 'I have enough time for hobbies and personal interests outside of work.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
        { id: 3, text: 'I regularly get enough sleep and rest.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
        { id: 4, text: 'My work schedule allows me to spend quality time with family and friends.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
        { id: 5, text: 'I feel I have a good balance between my professional and personal goals.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
      ]),
    },
  ];

  for (const a of assessments) {
    await conn.execute(
      `INSERT INTO assessments (id, title, description, category, duration_minutes, questions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [a.id, a.title, a.description, a.category, a.duration_minutes, a.questions]
    );
  }
};

exports.down = async function (conn) {
  await conn.execute('DELETE FROM assessments');
  await conn.execute('DELETE FROM counsellors');
};
