import React, { useState } from "react";
import Button from "./Button";

interface MenuWrapperProps {
    selectedCharacter: number;
    setSelectedCharacter: (character: number) => void;
    setScreen: (screen: string) => void;
    setUsername: (username: string) => void;
    setRoomId: (roomId: string) => void;
    roomId: string | null;
    username: string | null;
}

const MenuWrapper: React.FC<MenuWrapperProps> = ({
    selectedCharacter,
    setSelectedCharacter,
    setScreen,
    setUsername,
    setRoomId,
    roomId,
    username,
}) => {
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
                onChange={(e) => setRoomId(e.target.value)}
            />
            <Button
                className="mb-2"
                state={username && roomId ? "default" : "disabled"}
                onClick={() =>
                    username && roomId ? setScreen("waiting") : null
                }
            >
                Join the game
            </Button>
            <div className="mb-1">or</div>
            <Button
                state={username ? "default" : "disabled"}
                onClick={() => (username ? setScreen("waiting") : null)}
            >
                Create a game
            </Button>
        </div>
    );
};

export default MenuWrapper;

