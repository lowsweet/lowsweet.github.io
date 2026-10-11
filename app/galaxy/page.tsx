import type { Metadata } from 'next';
import LandingPage from '@/components/landing/landing-page';

export const metadata: Metadata = {
  title: 'LinkeAI · 星河中的 AI 工作台',
  description: '一站式 AI 工作台，聚合主流模型、智能体与创作工具。',
};

export default function GalaxyHome() {
  return <LandingPage />;
}
