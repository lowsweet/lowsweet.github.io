import type { Metadata } from 'next';
import StorytellingPage from '@/components/storytelling/storytelling-page';
import { STORYTELLING_COPY } from '@/lib/storytelling-types';

export const metadata: Metadata = {
  title: STORYTELLING_COPY['zh-CN'].title,
};

export default function Home() {
  return <StorytellingPage />;
}
