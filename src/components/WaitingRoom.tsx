import React, { useEffect } from "react";
import Button from "./Button";
import { useSocket } from "../contexts/SocketContext";
import { socket } from "../shared/api/socket";

interface WaitingRoomProps {
  team: number | null;
  roomId: string | null;
  setScreen: (screen: string) => void;
  handleTeamSelect: (teamNumber: number) => void;
  selectedCharacter: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  team,
  roomId,
  setScreen,
  handleTeamSelect,
}) => {
  const { roomUsers, startGame, isGameStarted } = useSocket();

  useEffect(() => {
    if (isGameStarted) {
      setScreen("game");
    }
  }, [isGameStarted, setScreen]);

  const handleStartGame = () => {
    if (roomId) {
      startGame(roomId);
    }
  };

  console.log(roomUsers);

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
            {/* {getTeamPlayers(1).map((player) => (
              <div key={player.id} className="player-name">
                {player.name} {player.name === username ? "(You)" : ""}
              </div>
            ))} */}
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
            {/* {getTeamPlayers(2).map((player) => (
              <div key={player.id} className="player-name">
                {player.name} {player.name === username ? "(You)" : ""}
              </div>
            ))} */}
          </div>
        </div>
      </div>

      <div className="unassigned-players">
        <h3>Connected Players:</h3>
        {/* {roomUsers != null &&
          roomUsers.map((player, index) => (
            <div key={index} className="player-name">
              {player.name || player} {player.id === socket.id ? "(You)" : ""}
            </div>
          ))} */}
        {roomUsers != null
          ? roomUsers.map((player, index) => (
              <div key={index} className="player-name">
                {player.id || player} {player.id === socket.id ? "(You)" : ""}
              </div>
            ))
          : null}
      </div>

      <Button
        color="default"
        state={roomUsers.length >= 2 ? "default" : "disabled"}
        onClick={handleStartGame}
      >
        Start game
      </Button>
      {roomUsers.length < 2 && (
        <p className="text-error">Need at least 2 players to start</p>
      )}
    </div>
  );
};

export default WaitingRoom;
