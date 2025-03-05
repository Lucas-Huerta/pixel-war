import { useRef, useState, useEffect } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { EventBus } from "./game/EventBus";
import MenuWrapper from "./components/MenuWrapper";
import Button from "./components/Button";
import WaitingRoom from "./components/WaitingRoom"; // Import the new component

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

    const changeScene = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene) {
                scene.changeScene();
            }
        }
    };

    const moveSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === "MainMenu") {
                // Get the update logo position
                scene.moveLogo(({ x, y }) => {
                    setPlayerPosition({ x, y });
                });
            }
        }
    };

    const addSprite = () => {
        if (phaserRef.current) {
            const scene = phaserRef.current.scene;

            if (scene) {
                // Add more stars
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);

                //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
                const star = scene.add.sprite(x, y, "star");

                //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
                //  You could, of course, do this from within the Phaser Scene code, but this is just an example
                //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1,
                });
            }
        }
    };

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        setCanMoveSprite(scene.scene.key !== "MainMenu");
    };

    const handleTeamSelect = (teamNumber: number) => {
        if (username) {
            // Remove user from the previous team
            if (team !== null) {
                const previousTeamPlayersDiv = document.querySelector(
                    `.team-players-${team}`
                );
                if (previousTeamPlayersDiv) {
                    const playerDivs =
                        previousTeamPlayersDiv.querySelectorAll("div");
                    playerDivs.forEach((div) => {
                        if (div.textContent === username) {
                            previousTeamPlayersDiv.removeChild(div);
                        }
                    });
                }
            }

            // Add user to the new team
            const newTeamPlayersDiv = document.querySelector(
                `.team-players-${teamNumber}`
            );
            if (newTeamPlayersDiv) {
                const playerDiv = document.createElement("div");
                playerDiv.className = "player-name";

                // Add character image next to the name
                const characterImg = document.createElement("img");
                characterImg.src = `assets/character_${
                    selectedCharacter + 1
                }.png`;
                characterImg.style.width = "1.5rem";
                characterImg.style.height = "1.5rem";

                playerDiv.appendChild(characterImg);

                const playerName = document.createTextNode(username);
                playerDiv.appendChild(playerName);
                newTeamPlayersDiv.appendChild(playerDiv);
            }
        }
        setTeam(teamNumber);
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
                                    setRoomId={setRoomId}
                                    roomId={roomId}
                                    username={username}
                                />
                            ) : (
                                <WaitingRoom
                                    team={team}
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
                                    <Button
                                        color="default"
                                        state="default"
                                        onClick={changeScene}
                                    >
                                        Change Scene
                                    </Button>
                                </div>
                                <div className="playerPosition">
                                    Player Position:
                                    <pre>{`x: ${Math.round(
                                        playerPosition.x
                                    )} y: ${Math.round(
                                        playerPosition.y
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

