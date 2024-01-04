// routes/index.tsx
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { PageContainerStyling } from "./team";

export type Match = {
  id: number;
  date: string;
  winnerId: number;
  loserId: number;
  winnerELO: number;
  loserELO: number;
  playerId: number | null;
};

type ELOLog = {
  id: number;
  playerId: number;
  elo: number;
  date: string;
};

type Player = {
  id: number;
  name: string;
  currentELO: number;
  matchesAsWinner: Match[];
  matchesAsLoser: Match[];
  eloLogs: ELOLog[];
};
type RouteData = {
  players: Player[];
};

export const meta: MetaFunction = () => {
  return [
    { title: "SB1U Bordtennis Champions" },
    {
      property: "og:title",
      content: "SB1U Bordetennis Champions",
    },
    {
      name: "description",
      content: "Her kan du registrere resultater fra SB1U Bordtenniskamper.",
    },
  ];
};

export default function Index() {
  return (
    <div className={PageContainerStyling}>
      <div className="grid xl:grid-cols-2 gap-4 md:gap-6">
        <Link
          to="/duel"
          className=" hover:bg-blue-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex flex-col items-center"
        >
          <span className="text-2xl md:mb-2 md:text-4xl dark:text-white text-gray-900 mt-2">
            1v1
          </span>
          <img
            src="img/1v1_table_tennis.jpeg"
            alt="1v1"
            className="w-1/2 md:w-full rounded"
          />
        </Link>
        <Link
          to="/team"
          className=" hover:bg-blue-700 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex flex-col items-center"
        >
          <span className="text-2xl md:mb-2 md:text-4xl mt-2 dark:text-white text-gray-900">
            2v2
          </span>
          <img
            src="img/2v2_table_tennis.jpeg"
            alt="2v2"
            className="w-1/2 md:w-full rounded"
          />
        </Link>
      </div>
    </div>
  );
}
