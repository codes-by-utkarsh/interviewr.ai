import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'interviewr.ai by Utkarsh — AI-Powered Technical Interview Platform',
  description:
    'Ace your next job interview with adaptive AI-powered mock interviews by Utkarsh. Upload your resume, practice with voice or text, and get detailed feedback reports.',
  keywords: ['mock interview', 'AI interview', 'interview practice', 'job preparation', 'interviewr.ai'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
