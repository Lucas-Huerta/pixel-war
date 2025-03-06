import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { useSocket } from "../contexts/SocketContext";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
  selectedCharacter: number;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
  function PhaserGame({ currentActiveScene, selectedCharacter }, ref) {
    const game = useRef<Phaser.Game | null>(null!);
    const { updatePlayerPosition, players, currentRoom } = useSocket();

    useLayoutEffect(() => {
      if (game.current === null) {
        game.current = StartGame("game-container");

        if (typeof ref === "function") {
          ref({ game: game.current, scene: null });
        } else if (ref) {
          ref.current = { game: game.current, scene: null };
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          if (game.current !== null) {
            game.current = null;
          }
        }
      };
    }, [ref]);

    useEffect(() => {
      EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        if (currentActiveScene && typeof currentActiveScene === "function") {
          currentActiveScene(scene_instance);
        }

        if (typeof ref === "function") {
          ref({ game: game.current, scene: scene_instance });
        } else if (ref) {
          ref.current = {
            game: game.current,
            scene: scene_instance,
          };
        }
      });
      return () => {
        EventBus.removeListener("current-scene-ready");
      };
    }, [currentActiveScene, ref]);

    useEffect(() => {
      if (game.current) {
        game.current.registry.set("selectedCharacter", selectedCharacter); // Store selected character
      }
    }, [selectedCharacter]);

    useEffect(() => {
      const handlePlayerMove = (position: { x: number; y: number }) => {
        updatePlayerPosition(position);
      };

      EventBus.on("player-move", handlePlayerMove);

      return () => {
        EventBus.off("player-move", handlePlayerMove);
      };
    }, [updatePlayerPosition]);

    useEffect(() => {
      if (game.current) {
        game.current.registry.set("players", players);
      }
    }, [players]);

    useEffect(() => {
      // Mettre à jour le registre quand les joueurs changent
      if (game.current && players.length > 0) {
        game.current.registry.set("players", players);
        game.current.registry.set("roomId", currentRoom?.id);
      }
    }, [players, currentRoom]);

    useEffect(() => {
      // Mettre à jour le registre avec les informations nécessaires
      if (game.current) {
        game.current.registry.set("selectedCharacter", selectedCharacter);
        game.current.registry.set("roomId", currentRoom?.id);
      }
    }, [selectedCharacter, currentRoom]);

    return <div id="game-container"></div>;
  },
);
