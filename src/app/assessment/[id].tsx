/**
 * CECUREUS — Interactive Self-Assessment Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { assessmentApi } from '../../services/api';

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: 'How often have you felt nervous or stressed in the past 2 weeks?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
  {
    id: 2,
    question: 'How often have you felt that you were unable to control important things in your life?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
  {
    id: 3,
    question: 'How often have you found it difficult to relax after work?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
  {
    id: 4,
    question: 'How often have you felt overwhelmed by your daily responsibilities?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
  {
    id: 5,
    question: 'How often have you had trouble sleeping due to racing thoughts?',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
  },
];

export default function AssessmentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number>(0);

  const title = id === 'burnout_eval' ? 'Burnout Assessment' : id === 'anxiety_screen' ? 'Anxiety Screening' : id === 'work_life_score' ? 'Work-Life Balance Score' : 'Stress Level Check';

  const currentQ = SAMPLE_QUESTIONS[currentIndex];
  const progressPercent = ((currentIndex + 1) / SAMPLE_QUESTIONS.length) * 100;

  const handleSelectOption = (optionIndex: number) => {
    const updated = { ...answers, [currentQ.id]: optionIndex };
    setAnswers(updated);

    if (currentIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score
      let total = 0;
      Object.values(updated).forEach((val) => {
        total += val;
      });
      const calculatedScore = Math.round((total / (SAMPLE_QUESTIONS.length * 4)) * 100);
      setScore(calculatedScore);
      setIsCompleted(true);

      // Async submit to API
      assessmentApi.submit(id?.toString() || 'stress_check', Object.entries(updated).map(([qId, val]) => ({ questionId: Number(qId), selectedOptionIndex: val }))).catch(() => {});
    }
  };

  const getScoreLevel = (val: number) => {
    if (val <= 35) return 'Low / Mild';
    if (val <= 70) return 'Moderate';
    return 'Elevated';
  };

  const getScoreDescription = (val: number) => {
    if (val <= 35) {
      return 'Your responses indicate mild levels. Continuing mindful practices and regular rest will support ongoing mental clarity.';
    }
    if (val <= 70) {
      return 'Your score shows moderate levels. Practicing breathing exercises, setting workplace boundaries, and speaking with Ally can help.';
    }
    return 'Your responses indicate elevated levels. We strongly recommend scheduling a confidential session with one of our certified counsellors.';
  };

  return (
    <ScreenContainer showHeader={true} showBack={true} headerTitle={title}>
      {!isCompleted ? (
        <View style={styles.container}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
              </Text>
              <Text style={styles.progressPercentage}>{Math.round(progressPercent)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* Question Card */}
          <Card style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQ.question}</Text>
          </Card>

          {/* Option Choices */}
          <View style={styles.optionsList}>
            {currentQ.options.map((option, idx) => {
              const isSelected = answers[currentQ.id] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectOption(idx)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
                    {isSelected && <View style={styles.optionCircleInner} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Back question button */}
          {currentIndex > 0 && (
            <Button
              title="Previous Question"
              variant="outline"
              size="sm"
              onPress={() => setCurrentIndex(currentIndex - 1)}
              style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
            />
          )}
        </View>
      ) : (
        /* Results View */
        <View style={styles.resultContainer}>
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Badge label="Assessment Completed" variant="success" />
              <Text style={styles.scoreTitle}>{title}</Text>
            </View>

            {/* Score Ring / Gauge */}
            <View style={styles.scoreGauge}>
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreOutOf}>/ 100</Text>
            </View>

            <Text style={styles.scoreLevel}>{getScoreLevel(score)}</Text>
            <Text style={styles.scoreDescription}>{getScoreDescription(score)}</Text>

            {/* Action Buttons */}
            <View style={styles.resultActions}>
              <Button
                title="Book a Counsellor"
                variant="primary"
                fullWidth
                onPress={() => router.push('/(tabs)/counsellor')}
                style={{ marginBottom: spacing.sm }}
              />
              <Button
                title="Talk with Ally"
                variant="outline"
                fullWidth
                onPress={() => router.push('/(tabs)/ally')}
              />
            </View>
          </Card>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  progressPercentage: {
    ...typography.captionBold,
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  questionCard: {
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  questionText: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionCircleSelected: {
    borderColor: colors.primary,
  },
  optionCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  resultContainer: {
    paddingVertical: spacing.md,
  },
  resultCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
  },
  scoreGauge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.md,
  },
  scoreNumber: {
    fontSize: 54,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreOutOf: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: 4,
  },
  scoreLevel: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scoreDescription: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  resultActions: {
    width: '100%',
  },
});
