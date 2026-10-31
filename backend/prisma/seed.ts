import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '../src/lib/prisma';
import { createQuizSchema } from '../src/schemas/quiz.schema';
import { createQuiz } from '../src/services/quiz.service';

async function main(): Promise<void> {
  const raw: unknown = JSON.parse(readFileSync(join(__dirname, 'sample-quiz.json'), 'utf-8'));
  const sample = createQuizSchema.parse(raw);

  const existing = await prisma.quiz.findFirst({ where: { title: sample.title } });
  if (existing) {
    console.info(`Sample quiz "${sample.title}" already exists, skipping.`);
    return;
  }

  const quiz = await createQuiz(sample);
  console.info(`Created sample quiz "${quiz.title}" with ${quiz.questions.length} questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
