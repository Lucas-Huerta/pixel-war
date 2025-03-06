import { useRef, useState, useEffect } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { EventBus } from "./game/EventBus";
import MenuWrapper from "./components/MenuWrapper";
import Button from "./components/Button";
import WaitingRoom from "./components/WaitingRoom"; // Import the new component
import { roomService } from "./shared/api/roomService";
import { socket } from "./shared/api/socket";
import { Room } from "./shared/types/room";
import { useSocket } from "./contexts/SocketContext";
import { socketService } from "./shared/api/socketService";

function App() {
  // The sprite can only be moved in the MainMenu Scene
  const [canMoveSprite, setCanMoveSprite] = useState(true);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [coloredPercentage, setColoredPercentage] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [screen, setScreen] = useState<String>("menu");
  const [team, setTeam] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const { currentRoom: socketRoom, joinRoom, isGameStarted } = useSocket();

  useEffect(() => {
    const handlePlayerMove = (x: number, y: number) => {
      setPlayerPosition({ x, y });
    };

    EventBus.on("player-move", handlePlayerMove);

    return () => {
      EventBus.off("player-move", handlePlayerMove);
    };
  }, []);

  useEffect(() => {
    const handleMapColored = (percentage: number) => {
      setColoredPercentage(percentage);
    };

    EventBus.on("map-colored", handleMapColored);

    return () => {
      EventBus.off("map-colored", handleMapColored);
    };
  }, []);

  useEffect(() => {
    if (socketRoom) {
      setCurrentRoom(socketRoom);
    }

    console.log("Socket Room: ", currentRoom);
  }, [socketRoom]);

  useEffect(() => {
    if (isGameStarted && screen !== "game") {
      setScreen("game");
    }
  }, [isGameStarted]);

  const changeScene = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as MainMenu;

      if (scene) {
        scene.changeScene();
      }
    }
  };

  const handleJoinCreatedRoom = (roomId: string) => {
    if (!username) return;
    joinRoom(roomId, username);
    setRoomId(roomId);
    setScreen("waiting");
  };

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    console.log("Current Scene: ", canMoveSprite);

    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  const handleTeamSelect = (teamNumber: number) => {
    if (!roomId || !username) return;

    const teamName = `team${teamNumber}`;
    console.log("Joining team:", teamName);

    // joinTeam(roomId, teamName);
    setTeam(teamNumber);
  };

  const handleJoinGame = async (roomId: string) => {
    try {
      if (!username) return;

      // Ajouter le joueur via l'API
      await roomService.addPlayer(roomId, {
        name: username,
        id: socket.id,
      });

      // Rejoindre la room via socket avec le username
      joinRoom(roomId, username);
      setRoomId(roomId);
      setScreen("waiting");
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
    };
  }, [roomId]);

  return (
    <>
      {(() => {
        if (screen === "menu" || screen === "waiting") {
          return (
            <div id="menu-wrapper">
              <h1>Pixel Battle</h1>
              {screen === "menu" ? (
                <MenuWrapper
                  selectedCharacter={selectedCharacter}
                  setSelectedCharacter={setSelectedCharacter}
                  setUsername={setUsername}
                  setScreen={setScreen}
                  setRoomId={handleJoinGame}
                  roomId={roomId}
                  username={username}
                  handleJoinCreatedRoom={handleJoinCreatedRoom}
                />
              ) : (
                <WaitingRoom
                  team={team}
                  roomId={roomId}
                  setScreen={setScreen}
                  handleTeamSelect={handleTeamSelect}
                  selectedCharacter={selectedCharacter}
                />
              )}
            </div>
          );
        } else if (screen === "game") {
          return (
            <div id="app">
              <div className="game-infos">
                <div>
                  <Button color="default" state="default" onClick={changeScene}>
                    Change Scene
                  </Button>
                </div>
                <div className="playerPosition">
                  Player Position:
                  <pre>{`x: ${Math.round(playerPosition.x)} y: ${Math.round(
                    playerPosition.y,
                  )}`}</pre>
                </div>
                <div className="mapColored">
                  Red team: {Math.round(coloredPercentage)}%
                </div>
              </div>
              <PhaserGame
                ref={phaserRef}
                currentActiveScene={currentScene}
                selectedCharacter={selectedCharacter}
              />
            </div>
          );
        } else {
          return <div>Other Screen</div>;
        }
      })()}
    </>
  );
}

export default App;
