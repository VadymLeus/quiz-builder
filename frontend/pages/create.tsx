import Head from 'next/head';
import QuizForm from '@/components/QuizForm/QuizForm';

export default function CreateQuizPage() {
  return (
    <>
      <Head>
        <title>Create quiz | Quiz Builder</title>
      </Head>
      <div className="page-header">
        <h1 className="page-title">Create a quiz</h1>
      </div>
      <QuizForm />
    </>
  );
}
