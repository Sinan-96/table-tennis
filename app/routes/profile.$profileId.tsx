import { ELOLog, Player } from "@prisma/client";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, ChangeEvent } from "react";
import { useNavigate } from "@remix-run/react";

import EloHistoryChart from "~/components/elo-history-charts";
import {
  getPlayerDetails,
  getPlayerELOHistory,
  getPlayerTeamELOHistory,
  getPlayers,
} from "~/services/playerService";

interface Opponent {
  name: string;
}

interface MatchSummary {
  id: number;
  date: string; // Assuming date is in ISO string format
  winnerELO?: number; // Present in matchesAsWinner
  loserELO?: number; // Present in matchesAsLoser
  loser?: Opponent; // Present in matchesAsWinner
  winner?: Opponent; // Present in matchesAsLoser
}

interface PlayerDetails {
  id: number;
  name: string;
  currentELO: number;
  currentTeamELO: number;
  previousELO: number | null;
  previousTeamELO: number | null;
  matchesAsWinner: MatchSummary[];
  matchesAsLoser: MatchSummary[];
  eloLogs: ELOLog[];
  teamEloLogs: ELOLog[];
}

export const loader: LoaderFunction = async ({ params }) => {
  const playerId = parseInt(params.profileId || "0", 10);

  const players = await getPlayers();

  if (playerId < 1) {
    return { eloHistory: [], playerDetails: {}, players };
  }

  try {
    const eloHistory = await getPlayerELOHistory(playerId);
    const playerDetails = await getPlayerDetails(playerId);
    const teamEloHistory = await getPlayerTeamELOHistory(playerId);

    return { eloHistory, playerDetails, players, teamEloHistory };
  } catch (error) {
    console.error("Failed to fetch player data:", error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};

export const meta: MetaFunction = () => {
  return [
    { title: "SB1U Krok Champions" },
    {
      property: "og:title",
      content: "SB1U Krokinole Champions",
    },
    {
      name: "description",
      content: "Her kan du registrere resultater fra SB1U Krokinolekamper.",
    },
  ];
};

interface PlayerSummary {
  id: number;
  name: string;
}

interface LoaderData {
  eloHistory: ELOLog[];
  playerDetails: PlayerDetails;
  teamEloHistory: ELOLog[];
  players: Player[];
}

export default function Profile() {
  const { eloHistory, playerDetails, players, teamEloHistory } =
    useLoaderData<LoaderData>();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(
    playerDetails ?? null
  );

  const navigate = useNavigate();

  if (!Array.isArray(eloHistory)) {
    return <div>Loading...</div>;
  }

  console.log({ players });

  let playersRankedByELO = [...players];
  playersRankedByELO.sort((p1, p2) => p2.currentELO - p1.currentELO);

  let playersRankedByTeamELO = [...players];
  playersRankedByTeamELO.sort(
    (p1, p2) => p2.currentTeamELO - p1.currentTeamELO
  );

  const handlePlayerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    console.log("Handling player change", event.target.value);
    const selectedPlayerId = parseInt(event.target.value, 10);
    setSelectedPlayer(players.find((p) => p.id === selectedPlayerId) || null);
    navigate(`/profile/${selectedPlayerId}`);
  };

  return (
    <div className="container h-screen p-2 ">
      <div className="flex-col items-center text-center justify-center">
        <select
          onChange={handlePlayerChange}
          className="self-center mb-4 text-xl w-1/2 py-2 px-3 border 
        border-gray-300 bg-white rounded-md shadow-sm focus:outline-none 
        focus:ring-primary-500 focus:border-primary-500 
        dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          defaultValue={
            selectedPlayer && selectedPlayer?.id > 0 ? selectedPlayer.id : ""
          }
        >
          <option className="flex text-center" value="" disabled>
            Velg spiller
          </option>
          {players?.map((player) => (
            <option
              className="flex text-center"
              key={player.id}
              value={player.id}
            >
              {player.name}
            </option>
          ))}
        </select>

        {selectedPlayer && selectedPlayer.id > 0 && (
          <div>
            <ul
              className="text-lg mb-2 space-y-2 bg-blue-100 dark:bg-gray-700 text-black dark:text-white p-4
         rounded-lg shadow-lg"
            >
              <li className="font-bold animate-pulse">
                ELO: {playerDetails.currentELO}
              </li>
              <>
                <li className="flex items-center space-x-2">
                  <span className="flex text-lg">
                    {playersRankedByELO.findIndex(
                      (player) => player.id === selectedPlayer?.id
                    ) < 5 && (
                      <div className="relative group">
                        <img
                          src="/img/medal.png"
                          alt="Medalje for topp 5 plassering"
                          className="w-8 h-8 mr-2"
                        />
                        <span
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 pb-1 opacity-0 
                    group-hover:opacity-100 bg-black text-white text-md rounded px-2 py-1 transition-opacity duration-300 hidden group-hover:block"
                        >
                          Medalje for topp 5 plassering
                        </span>
                      </div>
                    )}
                    Rangering duellspill:{" "}
                    {playersRankedByELO.findIndex(
                      (player) => player.id === selectedPlayer?.id
                    ) + 1}{" "}
                    / {playersRankedByELO.length}
                  </span>
                </li>
              </>{" "}
              <>
                <li className="flex items-center space-x-2">
                  <span className="flex p-2 text-lg">
                    {playersRankedByTeamELO.findIndex(
                      (player) => player.id === selectedPlayer?.id
                    ) < 5 && (
                      <div className="relative group">
                        <img
                          src="/img/medal.png"
                          alt="Medalje for topp 5 plassering"
                          className="w-8 h-8 mr-2"
                        />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 pb-1 opacity-0 group-hover:opacity-100 bg-black text-white text-md rounded px-2 py-1 transition-opacity duration-300 hidden group-hover:block">
                          Medalje for topp 5 plassering
                        </span>
                      </div>
                    )}
                    Rangering lagspill:{" "}
                    {playersRankedByTeamELO.findIndex(
                      (player) => player.id === selectedPlayer?.id
                    ) + 1}{" "}
                    / {playersRankedByTeamELO.length}
                  </span>
                </li>
              </>
            </ul>
            <h1 className="text-xl font-bold mb-4">
              Spillerens ELO i lagspill
            </h1>
            <EloHistoryChart data={teamEloHistory} />
            <h1 className="text-xl font-bold mb-4">
              {playerDetails.name}'s ELO History
            </h1>
            <EloHistoryChart data={eloHistory} />
            <div className="grid md:grid-cols-2 gap-2">
              <p className="">
                Kamper spilt:{" "}
                {playerDetails.matchesAsWinner.length +
                  playerDetails.matchesAsLoser.length}
              </p>{" "}
              <p className="">
                Antall kamper vunnet: {playerDetails.matchesAsWinner.length}
              </p>{" "}
              <p className="">Tap: {playerDetails.matchesAsLoser.length}</p>
              <p className="">
                Seiersprosent:{" "}
                {(
                  playerDetails.matchesAsWinner.length /
                  (playerDetails.matchesAsLoser.length +
                    playerDetails.matchesAsWinner.length)
                )
                  .toString()
                  .slice(2) + "%"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
