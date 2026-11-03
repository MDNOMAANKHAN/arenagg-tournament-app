
import { redirect } from 'next/navigation';

type Props = {
  searchParams: {
    game?: string;
  };
};

export default function TournamentsPage({ searchParams }: Props) {
  const requestedGame = searchParams.game;

  if (!requestedGame) {
    redirect('/#tournaments');
  }

  // Match the actual Free Fire MAX database slug.
  const game =
    requestedGame.toLowerCase() === 'freefire'
      ? 'free-fire-max'
      : requestedGame.toLowerCase();

  redirect(`/?game=${encodeURIComponent(game)}#tournaments`);
}
