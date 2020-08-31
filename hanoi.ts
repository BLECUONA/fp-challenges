type Disk = number;
type Stake = Disk[];
type AllStakes = Stake[];

const main = (size: number) => {
  let input = _initStakes(size);
  console.log(`------------> INIT STATE: [${JSON.stringify(input)}]`);

  const output = _handleAllStakes()(input).first();
  console.log(`------------> REORDERED STATE: ${JSON.stringify(output)}`);
  return output;
};

const _initStakes = (size: number) => {
  return [_createStake(size), _createStake(0), _createStake(0)];
};

const _createStake = (size: number): Stake => {
  let disks: Stake = [];
  for (let index = 0; index < size; index++) {
    disks.push(size - index);
  }
  return disks;
};

const _handleAllStakes = () => {
  const movementsHandler = _movementsHandler();
  const instance = (game: AllStakes) => {
    let gameClone = [...game];
    const handler = movementsHandler(gameClone);
    const isCompleted = _isCompleted(gameClone);
    return {
      ["first"]: () => {
        if (isCompleted()) return gameClone;
        const firstRes = handler.first();
        if (firstRes !== null) return instance(firstRes).first();
        return instance(gameClone).second();
      },
      ["second"]: () => {
        if (isCompleted()) return gameClone;
        const secondRes = handler.second();
        if (secondRes !== null) return instance(secondRes).second();
        return instance(gameClone).third();
      },
      ["third"]: () => {
        if (isCompleted()) return gameClone;
        const thirdRes = handler.third();
        if (thirdRes !== null) return instance(thirdRes).third();
        return instance(gameClone).first();
      },
    };
  };
  return instance;
};

const _isCompleted = (game: AllStakes) => {
  return () => game[0].length === 0 && game[1].length === 0;
};

const _movementsHandler = () => {
  const moveWithMemo = move();

  return (game: AllStakes) => {
    return {
      // Priority for shortest movement
      ["first"]: () => moveWithMemo(game, 0, 1) ?? moveWithMemo(game, 0, 2),
      // Priority for back movement
      ["second"]: () => moveWithMemo(game, 1, 2) ?? moveWithMemo(game, 1, 0),
      // Priority for movement to first stake
      ["third"]: () => moveWithMemo(game, 2, 0) ?? moveWithMemo(game, 2, 1),
    };
  };
};

const move = () => {
  let lastDiskMoved = null;
  let moveCount = 0;

  return (
    game: AllStakes,
    originIndex: number,
    destinationIndex: number
  ): AllStakes | null => {
    const originCol = game[originIndex];
    const destinationCol = game[destinationIndex];

    if (originCol.length === 0) return null;
    // Last movement cannot be repeated
    if (originCol[originCol.length] === lastDiskMoved) return null;
    // Move a disk onto a smaller disk is forbidden
    if (originCol[originCol.length] >= destinationCol[destinationCol.length])
      return null;

    let gameClone = [...game];
    const movingDisk = gameClone[originIndex].pop();
    gameClone[destinationIndex].push(Number(movingDisk));

    moveCount += 1;
    console.log(`Number of movements: ${moveCount}`);
    return gameClone;
  };
};

main(4);
