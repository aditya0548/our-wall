import React from 'react';
import { Heart, Star } from 'lucide-react';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export default function TicTacToeBoard({ board, isMyTurn, onMove, winnerId, myUserId, playerXId }) {
  // Find winning line if any
  let winningLine = null;
  if (winnerId) {
    for (const [a, b, c] of LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        winningLine = [a, b, c];
        break;
      }
    }
  }

  return (
    <div className="tic-tac-toe-board">
      {board.map((cell, index) => {
        const isWinCell = winningLine?.includes(index);
        const isEmpty = cell === "";
        const canClick = isMyTurn && isEmpty && !winnerId;

        return (
          <button
            key={index}
            className={`tic-tac-toe-cell ${canClick ? 'interactive' : ''} ${isWinCell ? 'win-cell' : ''}`}
            onClick={() => canClick && onMove(index)}
            disabled={!canClick}
            aria-label={`Cell ${index}`}
          >
            {cell === "X" && <Heart size={48} className="cell-mark-x" fill="currentColor" />}
            {cell === "O" && <Star size={48} className="cell-mark-o" fill="currentColor" />}
          </button>
        );
      })}
    </div>
  );
}
