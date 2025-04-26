import React, { useState, useEffect, useRef } from 'react';

const Player = ({ position }) => (
  <div
    className="absolute w-12 h-8 bg-[#03FF24] pixelated"
    style={{ left: position, bottom: 20 }}
  >
    <div className="w-4 h-4 bg-[#03FF24] absolute left-1/2 -translate-x-1/2 -top-4 border-2 border-black" />
    <div className="w-2 h-4 bg-[#03FF24] absolute left-1/4 -translate-x-1/2 top-2 border-2 border-black" />
    <div className="w-2 h-4 bg-[#03FF24] absolute right-1/4 translate-x-1/2 top-2 border-2 border-black" />
  </div>
);

const Bullet = ({ position }) => (
  <div
    className="absolute w-2 h-4 bg-[#03FF24] border-2 border-black pixelated"
    style={{ left: position.x, bottom: position.y }}
  />
);

const Enemy = ({ position }) => (
  <div
    className="absolute w-12 h-12 bg-[#03FF24] border-4 border-black pixelated"
    style={{ left: position.x, top: position.y }}
  >
    <div className="w-4 h-4 bg-black absolute left-2 top-2" />
    <div className="w-4 h-4 bg-black absolute right-2 top-2" />
  </div>
);

const Blast = ({ position }) => (
  <div
    className="absolute w-16 h-16 pixelated"
    style={{ left: position.x - 2, top: position.y - 2 }}
  >
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute w-4 h-4 bg-[#03FF24] border-2 border-black"
        style={{
          left: 16 + Math.cos(Math.random() * 2 * Math.PI) * 12,
          top: 16 + Math.sin(Math.random() * 2 * Math.PI) * 12,
          animation: `blast 0.2s ease-out ${Math.random() * 0.05}s forwards`,
        }}
      />
    ))}
  </div>
);

const Game = () => {
  const [playerPos, setPlayerPos] = useState(300);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [blasts, setBlasts] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('start');
  const gameAreaRef = useRef(null);

  const movePlayer = (e) => {
    if (gameState !== 'playing') return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    let newPos = e.clientX - rect.left - 24;
    if (e.type === 'touchmove') {
      newPos = e.touches[0].clientX - rect.left - 24;
    }
    newPos = Math.max(0, Math.min(newPos, rect.width - 48));
    setPlayerPos(newPos);
  };

  const shoot = () => {
    if (gameState !== 'playing') return;
    setBullets((prev) => [...prev, { x: playerPos + 22, y: 40 }]);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBullets([]);
    setEnemies([]);
    setBlasts([]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnEnemy = () => {
      const x = Math.random() * (gameAreaRef.current.offsetWidth - 48);
      setEnemies((prev) => [...prev, { x, y: 0 }]);
    };

    const gameLoop = setInterval(() => {
      // Update bullets
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + 8 }))
          .filter((b) => b.y < gameAreaRef.current.offsetHeight)
      );

      // Update enemies
      setEnemies((prev) =>
        prev
          .map((e) => ({ ...e, y: e.y + 4 }))
          .filter((e) => e.y < gameAreaRef.current.offsetHeight)
      );

      // Update blasts
      setBlasts((prev) =>
        prev.filter((b) => Date.now() - b.time < 200)
      );

      // Collision detection
      setBullets((prevBullets) => {
        let newBullets = [...prevBullets];
        setEnemies((prevEnemies) => {
          let newEnemies = [...prevEnemies];
          const bulletsToRemove = [];
          const enemiesToRemove = [];

          prevBullets.forEach((bullet, bIndex) => {
            prevEnemies.forEach((enemy, eIndex) => {
              if (
                bullet.x + 2 >= enemy.x &&
                bullet.x <= enemy.x + 48 &&
                bullet.y + 4 >= enemy.y &&
                bullet.y <= enemy.y + 48
              ) {
                bulletsToRemove.push(bIndex);
                enemiesToRemove.push(eIndex);
                setBlasts((prev) => [
                  ...prev,
                  { x: enemy.x + 16, y: enemy.y + 16, time: Date.now() },
                ]);
                setScore((prev) => prev + 10);
              }
            });
          });

          // Remove hit bullets and enemies
          newBullets = newBullets.filter((_, i) => !bulletsToRemove.includes(i));
          newEnemies = newEnemies.filter((_, i) => !enemiesToRemove.includes(i));

          return newEnemies;
        });
        return newBullets;
      });
    }, 1000 / 60);

    const enemySpawner = setInterval(spawnEnemy, 1000);

    return () => {
      clearInterval(gameLoop);
      clearInterval(enemySpawner);
    };
  }, [gameState]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') shoot();
      if (e.code === 'Enter' && gameState !== 'playing') startGame();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, playerPos]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#03FF24] font-mono">
      <h1 className="text-4xl mb-4 pixelated font-omiofont1">Matrix Blaster</h1>
      <div className="mb-4 pixelated font-omiofont1">Score: {score}</div>
      {gameState === 'start' && (
        <div className="text-center pixelated font-omiofont1">
          <p>Press Enter or Tap to Start</p>
          <p>Use Mouse/Touch to Move, Space to Shoot</p>
        </div>
      )}
      <div
        ref={gameAreaRef}
        className="relative w-[640px] h-[480px] border-4 border-[#03FF24] bg-black overflow-hidden pixelated"
        onMouseMove={movePlayer}
        onTouchMove={movePlayer}
        onClick={shoot}
      >
        {gameState === 'playing' && (
          <>
            <Player position={playerPos} />
            {bullets.map((b, i) => (
              <Bullet key={`bullet-${i}`} position={b} />
            ))}
            {enemies.map((e, i) => (
              <Enemy key={`enemy-${i}`} position={e} />
            ))}
            {blasts.map((b, i) => (
              <Blast key={`blast-${i}`} position={{ x: b.x, y: b.y }} />
            ))}
          </>
        )}
      </div>
      <style jsx>{`
        .pixelated {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        @keyframes blast {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
    </div>
  );
};

export default Game;