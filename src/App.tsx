import { useRef, useState, useEffect } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { EventBus } from "./game/EventBus";
import MenuWrapper from "./components/MenuWrapper";
import Button from "./components/Button";
import WaitingRoom from "./components/WaitingRoom"; // Import the new component
import { roomService } from "./shared/api/roomService";
import { socketService } from "./shared/api/socketService";
import { socket } from "./shared/api/socket";
import { Room } from "./shared/types/room";

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
    // Emit getRooms event to request the rooms
    socket.emit("getRooms");

    socket.on("allRooms", (rooms) => {
      console.log("Received rooms:", rooms);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off("allRooms");
    };
  }, [team]);

  useEffect(() => {
    // Écoute l'arrivée de nouveaux joueurs
    socketService.onPlayerJoined((newPlayer) => {
      setCurrentRoom((prevRoom) => {
        if (!prevRoom) return null;
        return {
          ...prevRoom,
          players: [
            ...prevRoom.players,
            {
              id: newPlayer.id,
              name: newPlayer.name,
              teamId: newPlayer.teamId,
            },
          ],
        };
      });
    });

    // Écoute les mises à jour de la liste des joueurs
    socketService.onRoomPlayersUpdate((players) => {
      setCurrentRoom((prevRoom) => {
        if (!prevRoom) return null;
        return {
          ...prevRoom,
          players: players,
        };
      });
    });

    return () => {
      socket.off("player:joined");
      socket.off("room:playersUpdate");
    };
  }, []);

  const changeScene = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as MainMenu;

      if (scene) {
        scene.changeScene();
      }
    }
  };

  const handleJoinCreatedRoom = (e: any) => {
    socketService.joinRoom(e || "");

    setRoomId(e || "");

    // Séparer l'émission et l'écoute
    socket.emit("getRoomUsers", e);

    // Écouter la réponse
    socket.on("roomUsers", (users) => {
      setCurrentRoom({
        id: e || "",
        teams: [...(currentRoom?.teams || [])],
        players: users.users.map((user: any) => ({
          id: user,
          name: user,
          teamId: "",
        })),
        isGameStarted: currentRoom?.isGameStarted || false,
      });
    });

    setScreen("waiting");
  };

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    console.log("Current Scene: ", canMoveSprite);

    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  const handleTeamSelect = (teamNumber: number) => {
    roomService.createTeam(roomId as string, teamNumber.toString()).then(() => {
      socketService.joinRoom(roomId as string);
    });

    const team = teamNumber.toString();

    setCurrentRoom({
      id: currentRoom?.id || roomId || "",
      teams: [
        ...(currentRoom?.teams || []),
        {
          id: team,
          name: `Team ${team}`,
          players: [
            ...(currentRoom?.players || [])
              .filter((player) => player.name === username)
              .map((player) => ({
                ...player,
                teamId: team.toString(),
              })),
          ],
        },
      ],
      players: currentRoom?.players || [],
      isGameStarted: currentRoom?.isGameStarted || false,
    });
    socket.emit("joinTeam", roomId, team);
    setTeam(teamNumber);
  };

  const handleJoinGame = async (roomId: string) => {
    try {
      if (!username) return;

      setCurrentRoom({
        id: roomId,
        players: [],
        teams: [],
        isGameStarted: false,
      });

      // Ajouter le joueur via l'API
      await roomService.addPlayer(roomId, {
        name: username,
        teamId: socket.id,
      });

      socketService.joinRoom(roomId);

      setRoomId(roomId);

      if (roomId) {
        setCurrentRoom({
          id: roomId,
          players: [
            ...(currentRoom?.players || []),
            {
              id: socket.id || "",
              name: username,
              teamId: undefined,
            },
          ],
          teams: currentRoom?.teams || [],
          isGameStarted: currentRoom?.isGameStarted || false,
        });
      }
      setScreen("waiting");
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

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
                  room={currentRoom}
                  username={username}
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
