import React from "react";
import Button from "./Button";

interface WaitingRoomProps {
  team: number | null;
  setScreen: (screen: string) => void;
  handleTeamSelect: (teamNumber: number) => void;
  selectedCharacter: number;
  roomId: string | null;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  team,
  setScreen,
  handleTeamSelect,
  roomId,
}) => {
  return (
    <div className="flex-center">
      <div>Room id :</div>
      <h2 className="mb-2">{roomId}</h2>
      <h2 className="mb-2">Choose your team</h2>
      <div className="team-select-wrapper">
        <div className="flex-center">
          <Button
            color={team === 1 ? "red" : "grey"}
            state="default"
            onClick={() => handleTeamSelect(1)}
            className="mb-2"
          >
            Team 1
          </Button>
          <h3 className="mb-1 text-red">Team 1</h3>
          <div className="team-players team-players-1"></div>
        </div>
        <div className="flex-center">
          <Button
            color={team === 2 ? "blue" : "grey"}
            state="default"
            onClick={() => handleTeamSelect(2)}
            className="mb-2"
          >
            Team 2
          </Button>
          <h3 className="text-blue mb-1">Team 2</h3>
          <div className="team-players team-players-2"></div>
        </div>
      </div>
      <Button color="default" state="default" onClick={() => setScreen("game")}>
        I'm ready!
      </Button>
    </div>
  );
};

export default WaitingRoom;
