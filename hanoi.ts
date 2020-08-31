// Récursivité
// 1.a) Tant qu'on peut déplacer jetons de la 1ere pile on les déplace
// 1.b) Tant qu'on peut déplacer jetons de 2nde pile on déplace
// Privilégier les mouvements vers l'avant à ceux vers l'arrière
// Privilégier les mouvements les + courts possibles (while?)
// // Faire ces mouvements en interdisant retour arrière (garder en memoire derniere configuration de chaque pile -> memo?)

// 2. Tant qu'on peut déplacer jetons de 3eme pile on déplace
// Reculer prioritairement jusqu'à 1ere pile

// règles communes :
// ne pas déplacer un jeton qui vient d'être déplacé

// 3. Recommencer (recursif)

// 4. Obtenir résultat

type Disk = number;
type Stake = Disk[];
type Game = Stake[];

const main = (size: number) => {
  let game = _initGame(size);

  console.log("------------> INIT GAME");
  console.log(game);

  const res = handleStacks(game);
  console.log("------------> MAIN RES");
  console.log(res.first());
};

const _initGame = (size: number) => {
  return [_createStake(size), _createStake(0), _createStake(0)];
};

const _createStake = (size: number): Stake => {
  let disks: Stake = [];
  for (let index = 0; index < size; index++) {
    disks.push(size - index);
  }
  return disks;
};

const handleStacks = (game: Game) => {
  let gameClone = [...game];
  const handleStakes = _handleStake(gameClone);
  const isCompleted = _isCompleted(gameClone);

  return {
    ["first"]: () => {
      if (isCompleted()) return gameClone;
      const firstRes = handleStakes.first();
      if (firstRes !== null) return handleStacks(firstRes).first();
      return handleStacks(gameClone).second();
    },
    ["second"]: () => {
      if (isCompleted()) return gameClone;
      const secondRes = handleStakes.second();
      if (secondRes !== null) return handleStacks(secondRes).second();
      return handleStacks(gameClone).third();
    },
    ["third"]: () => {
      if (isCompleted()) return gameClone;
      const thirdRes = handleStakes.third();
      if (thirdRes !== null) return handleStacks(thirdRes).third();
      return handleStacks(gameClone).first();
    },
  };
};

const _isCompleted = (game: Game) => {
  return () => game[0].length === 0 && game[1].length === 0;
};

const _handleStake = (game: Game) => {
  //   const moveWithMemo = move();

  return {
    // Privilégier les mouvements les + courts possibles (while?)
    ["first"]: () => moveWithMemo(game, 0, 1) ?? moveWithMemo(game, 0, 2),
    // Privilégier les mouvements vers l'avant à ceux vers l'arrière
    ["second"]: () => moveWithMemo(game, 1, 2) ?? moveWithMemo(game, 1, 0),
    // Reculer prioritairement jusqu'à 1ere pile
    ["third"]: () => moveWithMemo(game, 2, 0) ?? moveWithMemo(game, 2, 1),
  };
};

// règles communes :
const move = () => {
  let lastDiskMoved = null;
  let moveCount = 0;

  return (
    game: Game,
    originIndex: number,
    destinationIndex: number
  ): Game | null => {
    if (game[originIndex].length === 0) return null;
    // Last movement cannot be repeated
    if (game[originIndex][game[originIndex].length] === lastDiskMoved)
      return null;
    if (
      game[originIndex][game[originIndex].length] >=
      game[destinationIndex][game[destinationIndex].length]
    )
      return null;

    let gameClone = [...game];
    const movingDisk = gameClone[originIndex].pop();
    gameClone[destinationIndex].push(Number(movingDisk));

    moveCount += 1;
    console.log(`Number of movements: ${moveCount}`);
    return gameClone;
  };
};

const moveWithMemo = move();

main(4);
