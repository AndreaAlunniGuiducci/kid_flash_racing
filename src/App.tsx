// App.tsx
import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import kidFlash1 from "./assets/kid_flash/kidFlash1.jpg";
import kidFlash2 from "./assets/kid_flash/kidFlash2.jpg";
import flash from "./assets/kid_flash/fulmine.webp";
import obstacle from "./assets/kid_flash/ostacolo.png";
import life from "./assets/kid_flash/vita.webp";

type GameObject = {
  id: number;
  x: number;
  y: number;
  type: "lightning" | "obstacle";
};

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [lives, setLives] = useState(3);

  console.log(lives, "lives");
  // Jump action
  const jump = useCallback(() => {
    if (!isJumping && !gameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 700);
    }
  }, [isJumping, gameOver]);

  // Start game
  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameObjects([]);
    setGameStarted(true);
    setLives(3);
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      if (Math.random() < 0.1) {
        const type = Math.random() < 0.7 ? "lightning" : "obstacle";
        const newObject: GameObject = {
          id: Date.now(),
          x: window.innerWidth,
          y: type === "lightning" ? 150 : 50,
          type,
        };
        setGameObjects((prev) => [...prev, newObject]);
      }

      setGameObjects((prev) =>
        prev
          .map((obj) => ({ ...obj, x: obj.x - 10 }))
          .filter((obj) => {
            const kidFlashX = 100;
            const kidFlashWidth = 60;

            if (obj.x < kidFlashX + kidFlashWidth && obj.x + 30 > kidFlashX) {
              if (obj.type === "lightning" && isJumping) {
                setScore((s) => s + 1);
                return false;
              } else if (obj.type === "obstacle" && !isJumping) {
                if (lives > 1) {
                  setLives(lives - 1);
                  return false;
                } else {
                  setGameOver(true);
                  return false;
                }
              }
              return obj.x > -30;
            }
            return obj.x > -30;
          })
      );
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, isJumping, lives]);

  // Event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", jump);
    window.addEventListener("mousedown", jump);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", jump);
      window.removeEventListener("mousedown", jump);
    };
  }, [jump]);

  useEffect(() => {
    if (isJumping || gameOver) return; // Pause animation when jumping

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 2); // Alterna tra 0 e 1
    }, 400); // Regola questo valore per cambiare la velocità dell'animazione

    return () => clearInterval(interval);
  }, [isJumping, gameOver]);

  return (
    <div
      className="game-container"
      onClick={!gameStarted ? startGame : undefined}
    >
      {!gameStarted ? (
        <div className="start-screen">
          <h1>Kid Flash Race!</h1>
          <p>Premi/tocca per iniziare</p>
          <p>
            Tocca lo schermo per far saltare Kid Flash per prendere i fulmini
            fare punti ed evitare gli ostacoli
          </p>
        </div>
      ) : (
        <>
          <div
            className={`kid-flash ${isJumping ? "jump" : ""}`}
            style={{
              backgroundImage: `url(${
                currentFrame === 0 ? kidFlash1 : kidFlash2
              })`,
            }}
          ></div>
          {gameObjects.map((obj) => (
            <div
              key={obj.id}
              className={`game-object`}
              style={{
                left: obj.x,
                bottom: obj.y,
                backgroundImage: `url(${
                  obj.type === "lightning" ? flash : obstacle
                })`,
              }}
            ></div>
          ))}
          <div className="score">Punti: {score}</div>
          {lives > 1 && (
            <div className="lives">
              {lives > 1 && (
                <div className="lives">
                  {Array(lives)
                    .fill("")
                    .map((i) => (
                      <img src={life} />
                    ))}
                </div>
              )}
            </div>
          )}
          {gameOver && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <p>Punti: {score}</p>
              <button onClick={startGame}>Riprova</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
