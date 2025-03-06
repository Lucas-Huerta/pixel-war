import React, { useState } from "react";
import Button from "./Button";
import { roomService } from "../shared/api/roomService";

interface MenuWrapperProps {
  selectedCharacter: number;
  setSelectedCharacter: (character: number) => void;
  setScreen: (screen: string) => void;
  setUsername: (username: string) => void;
  setRoomId: (roomId: string) => void;
  roomId: string | null;
  username: string | null;
  handleJoinCreatedRoom: (roomToJoin: string) => void;
}

const MenuWrapper: React.FC<MenuWrapperProps> = ({
  selectedCharacter,
  setSelectedCharacter,
  setUsername,
  setRoomId,
  username,
  handleJoinCreatedRoom,
}) => {
  const [roomToJoin, setRoomToJoin] = useState<string | null>(null);

  return (
    <div className="flex-center">
      <h3 className="mb-1">Select your character</h3>
      <div className="character-select-wrapper">
        {[...Array(10)].map((_, index) => (
          <button
            key={index}
            className={`character-select ${
              selectedCharacter === index ? "is-selected" : ""
            }`}
            onClick={() => setSelectedCharacter(index)}
          >
            <img
              src={`assets/character_${index + 1}.png`}
              alt={`Character ${index + 1}`}
            />
          </button>
        ))}
      </div>
      <input
        className="input"
        type="text"
        placeholder="Enter your username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="input"
        type="text"
        placeholder="Room id"
        onChange={(e) => setRoomToJoin(e.target.value)}
      />
      <Button
        className="mb-2"
        state={username && roomToJoin ? "default" : "disabled"}
        onClick={() =>
          username && roomToJoin ? handleJoinCreatedRoom(roomToJoin) : null
        }
      >
        Join the game
      </Button>
      <div className="mb-1">or</div>
      <Button
        state={username ? "default" : "disabled"}
        onClick={() => {
          roomService.createRoom().then((room) => {
            setRoomId(room.id);
          });
        }}
      >
        Create a game
      </Button>
    </div>
  );
};

export default MenuWrapper;
