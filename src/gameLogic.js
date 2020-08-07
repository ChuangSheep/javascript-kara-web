window.GAMEVERSION = "Kara 0.1 jskara_web"
window.GAMENAME = 'jskara_web_based';

class GameLogicError extends Error {
  constructor(errStr = '', currentPosition = null) {
    super(errStr);

    if (currentPosition != null) {
      this.currentPosition = currentPosition;
      errStr += (": current position: " + currentPosition[0] + "," + currentPosition[1])
    }
    this.name = this.constructor.name;
    this.errStr = errStr;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GameLogicError);
    }
  }

  setErrorLine(line) {
    this.line = line;
    this.errStr += (": current line: " + line.toString())
  }
}


// eslint-disable-next-line no-unused-vars
class GameKernalError extends Error {
  constructor(errStr = '') {
    super(errStr);
    this.name = this.constructor.name;
    this.errStr = errStr;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GameKernalError);
    }
  }

  setErrorLine(line) {
    this.line = line;
    this.errStr += (": current line: " + line.toString())
  }
}


// expected args: {direction: 1, zIndex: 0, init: true}
class GameObject {
  constructor(x, y, args = {}) {
    if (args.direction === undefined) args.direction = 1;
    if (args.zIndex === undefined) args.zIndex = 0;
    if (args.init === undefined) args.init = true;
    if (args.pushable === undefined) args.pushable = false;
    this.xVal = x;
    this.yVal = y;
    this.direction = args.direction;
    this.zIndex = args.zIndex;
    this.pushable = args.pushable;
    this.type = this.constructor.name;
    this.__id = Math.random().toString(36).substr(2, 10) + Date.now().toString().slice(-6);
    this.processTimeoutCount = 0;
    this.timeout = 1000;
    args.init && window.$app.$root.$emit("addObject", { obj: this });
  }

  get xVal() { return this.x }
  get yVal() { return this.y }
  get getDirection() { return this.direction }
  get zVal() { return this.zIndex }

  // ABSTRACT
  get state() {
    console.warn(`Getter "state" of Object "${this.constructor.name}" is not implemented. This will return the default file. `)
    return 'Error';
  }

  set xVal(x) {
    if (x > window.$app.$root.$data.boardWidth) throw new GameLogicError("The given x is not valid: bigger than the board size:" + window.$app.$root.$data.boardWidth.toString());
    else this.x = x;
  }
  set yVal(y) {
    if (y > window.$app.$root.$data.boardHeight) throw new GameLogicError("The given y is not valid: bigger than the board size:" + window.$app.$root.$data.boardHeight.toString());
    else this.y = y;
  }

  changeDirection(newDirection) {
    if ([0, 1, 2, 3].includes(newDirection)) this.direction = newDirection;
    else throw new GameLogicError("The given direction is not valid(0-3): " + newDirection.toString());
  }

  bePushed() {
    throw new GameKernalError(`METHOD ABSTRACT: ${this.bePushed.name} is only callable when it is implemented`)
  }

  _bePushed() {
    throw new GameKernalError(`METHOD ABSTRACT: ${this._bePushed.name} is only callable when it is implemented`)
  }
}


// eslint-disable-next-line no-unused-vars
class Kara extends GameObject {
  constructor(x, y, args = {}) {
    if (args.zIndex === undefined) args.zIndex = 1;
    super(x, y, args);
    this.type = this.constructor.name;

    window.$app.$root.$data.currentKaraX = this.x.valueOf();
    window.$app.$root.$data.currentKaraY = this.y.valueOf();
    window.$app.$root.$data.currentKaraDirection = this.direction.valueOf();
  }

  _move() {
    if (this.direction === 0) {
      if (this.y > 1) {
        if (window.$app.$root.$data.board[this.x - 1][this.y - 2].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${this.x}, ${this.y - 1}] because there is already a object there with the same zIndex ${this.zIndex}`, [this.x, this.y]);
        if (window.$app.$root.$data.board[this.x - 1][this.y - 2].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.board[this.x - 1][this.y - 2].find((i) => i.zIndex === this.zIndex && i.pushable)._bePushed(this.direction);
        }
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.y--;
        window.$app.$root.$emit("addObject", { obj: this });
      }
      else throw new GameLogicError('Kara will walk out of bound. ', [this.x, this.y]);
    }
    else if (this.direction === 1) {
      if (this.x < window.$app.$root.$data.boardWidth) {
        if (window.$app.$root.$data.board[this.x][this.y - 1].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${this.x}, ${this.y - 1}] because there is already a object there with the same zIndex ${this.zIndex}`, [this.x, this.y]);
        if (window.$app.$root.$data.board[this.x][this.y - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.board[this.x][this.y - 1].find((i) => i.zIndex === this.zIndex && i.pushable)._bePushed(this.direction);
        }
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.x++;
        window.$app.$root.$emit("addObject", { obj: this });
      }
      else throw new GameLogicError('Kara will walk out of bound. ', [this.x, this.y]);
    }
    else if (this.direction === 2) {
      if (this.y < window.$app.$root.$data.boardHeight) {
        if (window.$app.$root.$data.board[this.x - 1][this.y].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${this.x}, ${this.y - 1}] because there is already a object there with the same zIndex ${this.zIndex}`, [this.x, this.y]);
        if (window.$app.$root.$data.board[this.x - 1][this.y].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.board[this.x - 1][this.y].find((i) => i.zIndex === this.zIndex && i.pushable)._bePushed(this.direction);
        }
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.y++;
        window.$app.$root.$emit("addObject", { obj: this });

      }
      else throw new GameLogicError('Kara will walk out of bound. ', [this.x, this.y]);
    }
    else if (this.direction === 3) {
      if (this.x > 1) {
        if (window.$app.$root.$data.board[this.x - 2][this.y - 1].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${this.x}, ${this.y - 1}] because there is already a object there with the same zIndex ${this.zIndex}`, [this.x, this.y]);
        if (window.$app.$root.$data.board[this.x - 2][this.y - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.board[this.x - 2][this.y - 1].find((i) => i.zIndex === this.zIndex && i.pushable)._bePushed(this.direction);
        }
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.x--;
        window.$app.$root.$emit("addObject", { obj: this });
      }
      else throw new GameLogicError('Kara will walk out of bound. ', [this.x, this.y]);
    }
  }

  move() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    if (window.$app.$root.$data.currentKaraDirection === 0) {
      if (window.$app.$root.$data.currentKaraY > 1) {
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 1][window.$app.$root.$data.currentKaraY - 2].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${window.$app.$root.$data.currentKaraX}, ${window.$app.$root.$data.currentKaraY - 1}] because there is already a object with the same zIndex ${this.zIndex}`, [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].find((i) => i.zIndex === this.zIndex && i.pushable).bePushed(window.$app.$root.$data.currentKaraDirection);
        }
        window.$app.$root.$data.currentKaraY = window.$app.$root.$data.currentKaraY.valueOf() - 1;
      }
      else throw new GameLogicError('Kara will walk out of bound. ', [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
    }
    else if (window.$app.$root.$data.currentKaraDirection === 1) {
      if (window.$app.$root.$data.currentKaraX < window.$app.$root.$data.boardWidth) {
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${window.$app.$root.$data.currentKaraX}, ${window.$app.$root.$data.currentKaraY - 1}] because there is already a object with the same zIndex ${this.zIndex}`, [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].find((i) => i.zIndex === this.zIndex && i.pushable).bePushed(window.$app.$root.$data.currentKaraDirection);
        }
        window.$app.$root.$data.currentKaraX = window.$app.$root.$data.currentKaraX.valueOf() + 1;
      }
      else throw new GameLogicError('Kara will walk out of bound. ', [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
    }
    else if (window.$app.$root.$data.currentKaraDirection === 2) {
      if (window.$app.$root.$data.currentKaraY < window.$app.$root.$data.boardHeight) {
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 1][window.$app.$root.$data.currentKaraY].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${window.$app.$root.$data.currentKaraX}, ${window.$app.$root.$data.currentKaraY - 1}] because there is already a object with the same zIndex ${this.zIndex}`, [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].find((i) => i.zIndex === this.zIndex && i.pushable).bePushed(window.$app.$root.$data.currentKaraDirection);
        }
        window.$app.$root.$data.currentKaraY = window.$app.$root.$data.currentKaraY.valueOf() + 1;
      }
      else throw new GameLogicError('Kara will walk out of bound. ', [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
    }
    else if (window.$app.$root.$data.currentKaraDirection === 3) {
      if (window.$app.$root.$data.currentKaraX > 1) {
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 2][window.$app.$root.$data.currentKaraY - 1].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Kara cannot walk to [${window.$app.$root.$data.currentKaraX}, ${window.$app.$root.$data.currentKaraY - 1}] because there is already a object with the same zIndex ${this.zIndex}`, [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
        if (window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX][window.$app.$root.$data.currentKaraY - 1].find((i) => i.zIndex === this.zIndex && i.pushable).bePushed(window.$app.$root.$data.currentKaraDirection);
        }
        window.$app.$root.$data.currentKaraX = window.$app.$root.$data.currentKaraX.valueOf() - 1;
      }
      else throw new GameLogicError('Kara will walk out of bound. ', [window.$app.$root.$data.currentKaraX, window.$app.$root.$data.currentKaraY]);
    }
    this.processTimeoutCount += 1;
    window.$app.$root.$data.timeoutPool.push(window.setTimeout(() => {
      this._move();
    }, this.processTimeoutCount * this.timeout));
  }

  _turnRight() {
    this.changeDirection(this.direction != 3 ? this.direction + 1 : 0);
  }

  turnRight() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    window.$app.$root.$data.currentKaraDirection = this.direction != 3 ? this.direction + 1 : 0;
    this.processTimeoutCount += 1;
    window.$app.$root.$data.timeoutPool.push(window.setTimeout(() => {
      this._turnRight();
    }, this.processTimeoutCount * this.timeout))
  }

  _turnLeft() {
    this.changeDirection(this.direction != 0 ? this.direction - 1 : 0)
  }

  turnLeft() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    window.$app.$root.$data.currentKaraDirection = this.direction != 3 ? this.direction + 1 : 0;
    this.processTimeoutCount += 1;
    window.$app.$root.$data.timeoutPool.push(window.setTimeout(() => {
      this._turnLeft();
    }, this.processTimeoutCount * this.timeout));
  }

  _putLeaf() {
    new Leaf(this.x, this.y);
  }

  putLeaf() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 1][window.$app.$root.$data.currentKaraY - 1].push({ type: "Leaf" });
    this.processTimeoutCount += 1;
    window.$app.$root.$data.timeoutPool.push(window.setTimeout(() => {
      this._putLeaf();
    }, this.processTimeoutCount * this.timeout))
  }

  _takeLeaf() {
    let hasLeaf = false;
    for (let obj of window.$app.$root.$data.board[this.x - 1][this.y - 1]) {
      if (obj.type === 'Leaf') hasLeaf = true;
    }
    if (hasLeaf) {
      window.$app.$root.$emit('deleteObject', { instanceName: "Leaf", x: this.x, y: this.y, save: true })
      window.$app.$root.$data.currentBoard[this.x - 1][this.y - 1].splice(window.$app.$root.$data.currentBoard[this.x - 1][this.y - 1].findIndex((i) => i.type === "Leaf"), 1);
    }
    else {
      throw new GameLogicError("There is no leaf under kara that could be taken.", [this.x, this.y])
    }
  }

  takeLeaf() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    let hasLeaf = false;
    for (let obj of window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 1][window.$app.$root.$data.currentKaraY - 1]) {
      if (obj.type === 'Leaf') hasLeaf = true;
    }
    if (hasLeaf) {
      window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 1][window.$app.$root.$data.currentKaraY - 1].splice(window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 1][window.$app.$root.$data.currentKaraY - 1].findIndex((i) => i.type === "Leaf"), 1);
    }
    else {
      throw new GameLogicError("There is no leaf under kara that could be taken.", [this.x, this.y])
    }

    this.processTimeoutCount += 1;
    window.$app.$root.$data.timeoutPool.push(window.setTimeout(() => {
      this._takeLeaf();
    }, this.processTimeoutCount * this.timeout))
  }

  onLeaf() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    return window.$app.$root.$data.currentBoard[window.$app.$root.$data.currentKaraX - 1][window.$app.$root.$data.currentKaraY - 1].some((i) => i.type === "Leaf");
  }

  treeFront() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    let frontX, frontY;
    switch (window.$app.$root.$data.currentKaraDirection) {
      case 0:
        frontX = window.$app.$root.$data.currentKaraX;
        frontY = window.$app.$root.$data.currentKaraY - 1;
        break;
      case 1:
        frontX = window.$app.$root.$data.currentKaraX + 1;
        frontY = window.$app.$root.$data.currentKaraY;
        break;
      case 2:
        frontX = window.$app.$root.$data.currentKaraX;
        frontY = window.$app.$root.$data.currentKaraY + 1;
        break;
      case 3:
        frontX = window.$app.$root.$data.currentKaraX - 1;
        frontY = window.$app.$root.$data.currentKaraY;
        break;
    }
    // False if that cell does not exist
    if (frontX <= 0 || frontY <= 0 || frontX > window.$app.$root.$data.boardWidth || frontY > window.$app.$root.$data.boardHeight) return false;
    return window.$app.$root.$data.currentBoard[frontX - 1][frontY - 1].some((i) => i.type === "Tree");
  }

  treeLeft() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    let leftX, leftY;
    switch (window.$app.$root.$data.currentKaraDirection) {
      case 0:
        leftX = window.$app.$root.$data.currentKaraX - 1;
        leftY = window.$app.$root.$data.currentKaraY;
        break;
      case 1:
        leftX = window.$app.$root.$data.currentKaraX;
        leftY = window.$app.$root.$data.currentKaraY - 1;
        break;
      case 2:
        leftX = window.$app.$root.$data.currentKaraX + 1;
        leftY = window.$app.$root.$data.currentKaraY;
        break;
      case 3:
        leftX = window.$app.$root.$data.currentKaraX;
        leftY = window.$app.$root.$data.currentKaraY + 1;
        break;
    }
    // False if that cell does not exist
    if (leftX <= 0 || leftY <= 0 || leftX > window.$app.$root.$data.boardWidth || leftY > window.$app.$root.$data.boardHeight) return false;
    return window.$app.$root.$data.currentBoard[leftX - 1][leftY - 1].some((i) => i.type === "Tree");
  }

  treeRight() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    let rightX, rightY;
    switch (window.$app.$root.$data.currentKaraDirection) {
      case 0:
        rightX = window.$app.$root.$data.currentKaraX + 1;
        rightY = window.$app.$root.$data.currentKaraY;
        break;
      case 1:
        rightX = window.$app.$root.$data.currentKaraX;
        rightY = window.$app.$root.$data.currentKaraY + 1;
        break;
      case 2:
        rightX = window.$app.$root.$data.currentKaraX - 1;
        rightY = window.$app.$root.$data.currentKaraY;
        break;
      case 3:
        rightX = window.$app.$root.$data.currentKaraX;
        rightY = window.$app.$root.$data.currentKaraY - 1;
        break;
    }
    // False if that cell does not exist
    if (rightX <= 0 || rightY <= 0 || rightX > window.$app.$root.$data.boardWidth || rightY > window.$app.$root.$data.boardHeight) return false;
    return window.$app.$root.$data.currentBoard[rightX - 1][rightY - 1].some((i) => i.type === "Tree");
  }

  mashroomFront() {
    if (window.$app.$root.$data.currentKaraX === -1) window.$app.$root.$data.currentKaraX = this.x.valueOf();
    if (window.$app.$root.$data.currentKaraY === -1) window.$app.$root.$data.currentKaraY = this.y.valueOf();
    let frontX, frontY;
    switch (window.$app.$root.$data.currentKaraDirection) {
      case 0:
        frontX = window.$app.$root.$data.currentKaraX;
        frontY = window.$app.$root.$data.currentKaraY - 1;
        break;
      case 1:
        frontX = window.$app.$root.$data.currentKaraX + 1;
        frontY = window.$app.$root.$data.currentKaraY;
        break;
      case 2:
        frontX = window.$app.$root.$data.currentKaraX;
        frontY = window.$app.$root.$data.currentKaraY + 1;
        break;
      case 3:
        frontX = window.$app.$root.$data.currentKaraX - 1;
        frontY = window.$app.$root.$data.currentKaraY;
        break;
    }
    // False if that cell does not exist
    if (frontX <= 0 || frontY <= 0 || frontX > window.$app.$root.$data.boardWidth || frontY > window.$app.$root.$data.boardHeight) return false;
    return window.$app.$root.$data.currentBoard[frontX - 1][frontY - 1].some((i) => i.type === "Mashroom");
  }

  get state() {
    return this.constructor.name;
  }
}


class Leaf extends GameObject {
  constructor(x, y, args = {}) {
    super(x, y, args);
    this.type = this.constructor.name;
  }

  get state() {
    return this.constructor.name;
  }
}


// eslint-disable-next-line no-unused-vars
class Mashroom extends GameObject {
  constructor(x, y, args = {}) {
    if (args.zIndex === undefined) args.zIndex = 1;
    if (args.pushable === undefined) args.pushable = true;
    super(x, y, args);
    this.type = this.constructor.name;
  }

  get state() {
    return this.constructor.name;
  }

  bePushed(directionTo) {
    if (this.currentX === undefined) this.currentX = this.x.valueOf();
    if (this.currentY === undefined) this.currentY = this.y.valueOf();
    if (directionTo === 0) {
      if (this.y > 1) {
        if (window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 2].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX}, ${this.currentY - 1}] because there is already a object with the same zIndex ${this.zIndex}`, [this.currentX, this.currentY]);
        if (window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 2].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX}, ${this.currentY - 1}] because there is another pushable object. Kara can only push one mashroom at once.`, [this.currentX, this.currentY])
        }

        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].splice(window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].findIndex((i) => i.__id === this.__id), 1);
        this.currentY -= 1;
        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].push(this);
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound. ', [this.currentX, this.currentY]);
    }
    else if (directionTo === 1) {
      if (this.x < window.$app.$root.$data.boardWidth) {
        if (window.$app.$root.$data.currentBoard[this.currentX][this.currentY - 1].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX + 1}, ${this.currentY}] because there is already a object with the same zIndex ${this.zIndex}`, [this.currentX, this.currentY]);
        if (window.$app.$root.$data.currentBoard[this.currentX][this.currentY - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX + 1}, ${this.currentY}] because there is another pushable object. Kara can only push one mashroom at once.`, [this.currentX, this.currentY])
        }

        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].splice(window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].findIndex((i) => i.__id === this.__id), 1);
        this.currentX += 1;
        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].push(this);
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound. ', [this.currentX, this.currentY]);
    }
    else if (directionTo === 2) {
      if (this.y < window.$app.$root.$data.boardHeight) {
        if (window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX}, ${this.currentY + 1}] because there is already a object with the same zIndex ${this.zIndex}`, [this.currentX, this.currentY]);
        if (window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX}, ${this.currentY + 1}] because there is another pushable object. Kara can only push one mashroom at once.`, [this.currentX, this.currentY])
        }

        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].splice(window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].findIndex((i) => i.__id === this.__id), 1);
        this.currentY += 1;
        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].push(this);
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound. ', [this.currentX, this.currentY]);
    }
    else if (directionTo === 3) {
      if (this.x > 1) {
        if (window.$app.$root.$data.currentBoard[this.currentX - 2][this.currentY - 1].some((i) => i.zIndex === this.zIndex && !i.pushable))
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX - 1}, ${this.currentY}] because there is already a object with the same zIndex ${this.zIndex}`, [this.currentX, this.currentY]);
        if (window.$app.$root.$data.currentBoard[this.currentX - 2][this.currentY - 1].some((i) => i.zIndex === this.zIndex && i.pushable)) {
          throw new GameLogicError(`Mashroom cannot be pushed to [${this.currentX - 1}, ${this.currentY}] because there is another pushable object. Kara can only push one mashroom at once.`, [this.currentX, this.currentY])
        }

        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].splice(window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].findIndex((i) => i.__id === this.__id), 1);
        this.currentX -= 1;
        window.$app.$root.$data.currentBoard[this.currentX - 1][this.currentY - 1].push(this);
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound. ', [this.currentX, this.currentY]);
    }
  }

  _bePushed(directionTo) {
    if (directionTo === 0) {
      if (this.y > 1) {
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.y -= 1;
        window.$app.$root.$emit("addObject", { obj: this });
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound ', [this.x, this.y]);
    }
    else if (directionTo === 1) {
      if (this.x < window.$app.$root.$data.boardWidth) {
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.x += 1;
        window.$app.$root.$emit("addObject", { obj: this });
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound ', [this.x, this.y]);
    }
    else if (directionTo === 2) {
      if (this.y < window.$app.$root.$data.boardHeight) {
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.y += 1;
        window.$app.$root.$emit("addObject", { obj: this });
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound ', [this.x, this.y]);
    }
    else if (directionTo === 3) {
      if (this.x > 1) {
        window.$app.$root.$emit("deleteObject", { obj: this });
        this.x -= 1;
        window.$app.$root.$emit("addObject", { obj: this });
      }
      else throw new GameLogicError('Mashroom cannot be pushed out of bound ', [this.x, this.y]);
    }
  }
}


// eslint-disable-next-line no-unused-vars
class Tree extends GameObject {
  constructor(x, y, args = {}) {
    if (args.zIndex === undefined) args.zIndex = 1;
    super(x, y, args);
    this.type = this.constructor.name;
  }
  get state() {
    return this.constructor.name;
  }
}

module.exports = {
  GameObject,
  Kara,
  Leaf,
  Tree,
  Mashroom,
  GameLogicError,
  GameKernalError,
}


// eslint-disable-next-line no-unused-vars
function getKaraInstance() {
  for (let obj of window.$app.$root.$data.createdObjects) {
    if (obj.type === "Kara") {
      return obj;
    }
  }
  return null;
}