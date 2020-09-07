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

/** Apply appropriate handler for each stake */
const _handleAllStakes = () => {
  // This instantiation is done only once, in order to share the same memo for next recursive logic
  const movementsHandler = _movementsHandlerWithMemo();

  //#region RECURSIVE LOGIC

  // This exported function is named in order to be used recursively
  const instance = (stakes: AllStakes) => {
    let stakesClone = [...stakes];

    const movesHandler = movementsHandler(stakesClone);

    // Initialization of _partialStakeHandler() with common params
    const partialStakeHandler = _partialStakeHandler(
      stakesClone,
      movesHandler,
      instance
    );

    // Return function calling _partialStakeHandler() with all params
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

  //#endregion RECURSIVE LOGIC
};

/**  Individual handler for each stake (using FP partial principle)  */
const _partialStakeHandler = (
  stakes: AllStakes,
  handler: MovementsHandlerObj,
  instance: MovementsHandler
) => {
  return (currentColumn: ColumnName, nextColumn: ColumnName) =>
    stakeHandler(stakes, handler, instance, currentColumn, nextColumn);
};

/** Individual generic stake handler */
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
            ? instance(x)[currentColumn]() // We continue to handle currentColumn because we don't know if other moves are possible on it
            : instance(stakes)[nextColumn]() // We handle nextColumn because no more moves are possible on currentColumn
      )();
};

const compose = <T, U>(f: ZeroAryFunction<T>, g: UnaryFunction<T, U>) => {
  return () => g(f());
};

const _isCompleted = (stakes: AllStakes) =>
  stakes[0].length === 0 && stakes[1].length === 0;

/** Defined specific moves rules for each stake */
const _movementsHandlerWithMemo = (): MovementsHandler => {
  const moveWithMemo = move();

  // Function is returned with memoized move()
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

/**
 * Defined common moves rules
 * NB: We use memoization to forbid previous movement to be repeated
 * */
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
