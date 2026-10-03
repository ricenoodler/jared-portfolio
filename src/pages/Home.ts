import { FeaturedProjects } from '../components/FeaturedProjects';
import { Hero } from '../components/Hero';
import { Interests } from '../components/Interests';
import { LatestNotes } from '../components/LatestNotes';
import { Moments } from '../components/Moments';
import { Trivia } from '../components/Trivia';
import { Values } from '../components/Values';

export function Home(): string {
  return Hero() + FeaturedProjects() + Interests() + Values() + Trivia() + Moments() + LatestNotes();
}