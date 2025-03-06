import React from "react";
import Button from "./Button";
import { Room } from "../shared/types/room";

interface WaitingRoomProps {
  team: number | null;
  room: Room | null;
  username: string | null;
  roomId: string | null;
  setScreen: (screen: string) => void;
  handleTeamSelect: (teamNumber: number) => void;
  selectedCharacter: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  team,
  room,
  username,
  roomId,
  setScreen,
  handleTeamSelect,
}) => {
  const getTeamPlayers = (teamId: number) => {
    if (!room) return [];
    if (room.players != null) {
      return (
        room.teams.find((team) => team.id === teamId.toString())?.players || []
      );
    }
    return [];
  };

  return (
    <div className="flex-center">
      <div>Room id: {roomId}</div>
      <h2 className="mb-2">Choose your team</h2>

      <div className="team-select-wrapper">
        <div className="flex-center">
          <Button
            color={team === 1 ? "red" : "grey"}
            state="default"
            onClick={() => handleTeamSelect(1)}
          >
            Team 1
          </Button>
          <div className="team-players">
            {getTeamPlayers(1).map((player) => (
              <div key={player.id} className="player-name">
                {player.name} {player.name === username ? "(You)" : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-center">
          <Button
            color={team === 2 ? "blue" : "grey"}
            state="default"
            onClick={() => handleTeamSelect(2)}
          >
            Team 2
          </Button>
          <div className="team-players">
            {getTeamPlayers(2).map((player) => (
              <div key={player.id} className="player-name">
                {player.name} {player.name === username ? "(You)" : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="unassigned-players">
        <h3>Waiting for team selection:</h3>
        {room?.players.map((onePlayer, index) => (
          <div key={index} className="player-name">
            {onePlayer.id != null ? onePlayer.id : onePlayer.toString()}
          </div>
        ))}
      </div>

      <Button color="default" state="default" onClick={() => setScreen("game")}>
        I'm ready!
      </Button>
    </div>
  );
};

export default WaitingRoom;
