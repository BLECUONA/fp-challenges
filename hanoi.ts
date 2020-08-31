type Disk = number;
type Stake = Disk[];
type AllStakes = Stake[];
type ZeroAryFunction<T> = () => T;
type UnaryFunction<T, U> = (x: T) => U;

enum ColumnName {
  first = "first",
  second = "second",
  third = "third",
}
type SingleMovementHandler = () => AllStakes | null;
type MovementsHandler = (
  stakes: AllStakes
) => {
  [ColumnName.first]: SingleMovementHandler;
  [ColumnName.second]: SingleMovementHandler;
  [ColumnName.third]: SingleMovementHandler;
};
type MovementsHandlerObj = {
  [ColumnName.first]: SingleMovementHandler;
  [ColumnName.second]: SingleMovementHandler;
  [ColumnName.third]: SingleMovementHandler;
};

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
  const instance = (stakes: AllStakes) => {
    let stakesClone = [...stakes];
    const movesHandler = movementsHandler(stakesClone);
    const partialStakeHandler = _partialStakeHandler(
      stakesClone,
      movesHandler,
      instance
    );
    return {
      [ColumnName.first]: () =>
        partialStakeHandler(ColumnName.first, ColumnName.second),
      [ColumnName.second]: () =>
        partialStakeHandler(ColumnName.second, ColumnName.third),
      [ColumnName.third]: () =>
        partialStakeHandler(ColumnName.third, ColumnName.first),
    };
  };
  return instance;
};

const _partialStakeHandler = (
  stakes: AllStakes,
  handler: MovementsHandlerObj,
  instance: MovementsHandler
) => {
  return (currentColumn: ColumnName, nextColumn: ColumnName) =>
    stakeHandler(stakes, handler, instance, currentColumn, nextColumn);
};

const stakeHandler = (
  stakes: AllStakes,
  handler: MovementsHandlerObj,
  instance: MovementsHandler,
  currentColumn: ColumnName,
  nextColumn: ColumnName
) => {
  return _isCompleted(stakes)
    ? stakes
    : compose(
        () => handler[currentColumn](),
        (x) =>
          x !== null
            ? instance(x)[currentColumn]()
            : instance(stakes)[nextColumn]()
      )();
};

const compose = <T, U>(f: ZeroAryFunction<T>, g: UnaryFunction<T, U>) => {
  return () => g(f());
};

const _isCompleted = (stakes: AllStakes) =>
  stakes[0].length === 0 && stakes[1].length === 0;

const _movementsHandler = (): MovementsHandler => {
  const moveWithMemo = move();

  return (stakes: AllStakes) => {
    return {
      // Priority for shortest movement
      [ColumnName.first]: () =>
        moveWithMemo(stakes, 0, 1) ?? moveWithMemo(stakes, 0, 2),
      // Priority for back movement
      [ColumnName.second]: () =>
        moveWithMemo(stakes, 1, 2) ?? moveWithMemo(stakes, 1, 0),
      // Priority for movement to first stake
      [ColumnName.third]: () =>
        moveWithMemo(stakes, 2, 0) ?? moveWithMemo(stakes, 2, 1),
    };
  };
};

const move = () => {
  let lastDiskMoved = null;
  let moveCount = 0;

  return (
    stakes: AllStakes,
    originIndex: number,
    destinationIndex: number
  ): AllStakes | null => {
    const originCol = stakes[originIndex];
    const destinationCol = stakes[destinationIndex];

    if (originCol.length === 0) return null;
    // Last movement cannot be repeated
    if (originCol[originCol.length] === lastDiskMoved) return null;
    // Move a disk onto a smaller disk is forbidden
    if (originCol[originCol.length] >= destinationCol[destinationCol.length])
      return null;

    let stakesClone = [...stakes];
    const movingDisk = stakesClone[originIndex].pop();
    stakesClone[destinationIndex].push(Number(movingDisk));

    moveCount += 1;
    console.log(`Number of movements: ${moveCount}`);
    return stakesClone;
  };
};

main(5);
