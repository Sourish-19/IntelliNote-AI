import React, { useState } from 'react';
import type { GeneratedContent, Question, Flashcard } from '../types';
import { NoteIcon, QuestionIcon, FlashcardIcon, CopyIcon, CheckIcon } from './icons';

type Tab = 'notes' | 'questions' | 'flashcards';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold rounded-t-lg border-b-2 transition-colors duration-200 ${
      active
        ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
        : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-blue-500 dark:hover:text-blue-300 hover:border-blue-500 dark:hover:border-blue-300'
    }`}
  >
    {children}
  </button>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the card from flipping when copying
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100/50 dark:bg-gray-900/50 rounded-full transition z-10">
            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
        </button>
    );
};

const FlashcardCard: React.FC<{ card: Flashcard }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full h-64 [perspective:1000px] group">
            <div 
                className={`relative w-full h-full transform-preserve-3d transition-transform duration-700 ease-in-out group-hover:scale-105 ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Front Side */}
                <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-6 rounded-xl shadow-lg border cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CopyButton textToCopy={card.front} />
                    <p className="text-center font-bold text-xl text-gray-800 dark:text-gray-100">{card.front}</p>
                </div>
                
                {/* Back Side */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 cursor-pointer">
                    <CopyButton textToCopy={card.back} />
                    <p className="text-center font-medium text-lg text-blue-600 dark:text-blue-400">{card.back}</p>
                </div>
            </div>
        </div>
    );
};

const QuestionCard: React.FC<{ question: Question, index: number }> = ({ question, index }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const questionContent = `Q: ${question.question}\nOptions: ${question.options?.join(', ')}\nAnswer: ${question.answer}`;
    return (
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <CopyButton textToCopy={questionContent} />
            <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">{index + 1}. {question.question}</p>
            {question.options && (
                <ul className="space-y-2 mb-4">
                    {question.options.map((opt, i) => <li key={i} className="text-gray-600 dark:text-gray-300">- {opt}</li>)}
                </ul>
            )}
            <button onClick={() => setShowAnswer(!showAnswer)} className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {showAnswer ? 'Hide' : 'Show'} Answer
            </button>
            {showAnswer && (
                <p className="mt-2 p-3 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-md animate-fade-in">
                    <strong>Answer:</strong> {question.answer}
                </p>
            )}
        </div>
    );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-500 dark:text-gray-400 animate-fade-in">
        <p>{message}</p>
    </div>
);


export const OutputDisplay: React.FC<{ content: GeneratedContent }> = ({ content }) => {
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
          <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
            <NoteIcon className="w-5 h-5"/>
            <span>Notes</span>
          </TabButton>
          <TabButton active={activeTab === 'questions'} onClick={() => setActiveTab('questions')}>
            <QuestionIcon className="w-5 h-5"/>
            <span>Questions</span>
          </TabButton>
          <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')}>
            <FlashcardIcon className="w-5 h-5"/>
            <span>Flashcards</span>
          </TabButton>
        </nav>
      </div>

      <div>
        {activeTab === 'notes' && (
          content.notes?.summary ? (
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 animate-fade-in">
              <CopyButton textToCopy={content.notes.summary} />
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{content.notes.summary}</p>
            </div>
          ) : <EmptyState message="No notes were generated." />
        )}
        {activeTab === 'questions' && (
          content.questions?.length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              {content.questions.map((q, i) => <QuestionCard key={i} question={q} index={i} />)}
            </div>
          ) : <EmptyState message="No questions were generated." />
        )}
        {activeTab === 'flashcards' && (
           content.flashcards?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
               {content.flashcards.map((fc, i) => <FlashcardCard key={i} card={fc} />)}
            </div>
          ) : <EmptyState message="No flashcards were generated." />
        )}
      </div>
    </div>
  );
};
