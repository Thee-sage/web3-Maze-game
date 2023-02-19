import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5173/");

const IndexPage = () => {
  const [prizeDoor, setPrizeDoor] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleWinnerSubmit = (name) => {
    socket.emit("winner", name);
    console.log(`Submitted winner: ${name}`);
  };

  if (!prizeDoor) {
    return <div>Waiting for prize door from server...</div>;
  }

  return (
    <div>
      <h1>THE MAZE</h1>
      <Game prizeDoor={prizeDoor} onWinnerSubmit={handleWinnerSubmit} />
    </div>
  );
};

const Game = ({ prizeDoor, onWinnerSubmit }) => {
  const [currentNode, setCurrentNode] = useState({
    value: 1,
    left: {
      value: 1,
      left: {
        value: 3,
        left: {
          value: 9,
          left: {
            value: 19,
          },
          right: {
            value: 20,
          },
        },
        right: {
          value: 10,
          left: {
            value: 21,
          },
          right: {
            value: 22,
          },
        },
      },
      right: {
        value: 4,
        left: {
          value: 8,
          left: {
            value: 18,
          },
          right: {
            value: 17,
          },
        },
        right: {
          value: 7,
          left: {
            value: 16,
          },
          right: {
            value: 15,
          },
        },
      },
    },
    right: {
      value: 2,
      left: {
        value: 6,
        left: {
          value: 11,
          left: {
            value: 23,
          },
          right: {
            value: 24,
          },
        },
        right: {
          value: 12,
          left: {
            value: 25,
          },
          right: {
            value: 26,
          },
        },
      },
      right: {
        value: 5,
        left: {
          value: 14,
          left: {
            value: 29,
          },
          right: {
            value: 30,
          },
        },
        right: {
          value: 13,
          left: {
            value: 28,
          },
          right: {
            value: 27,
          },
        },
      },
    },
  });
  const [level, setLevel] = useState(1);
  const [previousNodes, setPreviousNodes] = useState([]);

  const handleLeftDoor = () => {
    setPreviousNodes([...previousNodes, currentNode]);
    setCurrentNode(currentNode.left);
    setLevel(level + 1);
  };

  const handleRightDoor = () => {
    setPreviousNodes([...previousNodes, currentNode]);
    setCurrentNode(currentNode.right);
    setLevel(level + 1);
  };

  const handleGoBack = () => {
    const prevNode = previousNodes.pop();
    setCurrentNode(prevNode);
    setPreviousNodes(previousNodes);
    setLevel(level - 1);
  };

  useEffect(() => {
    socket.on("prizeDoor", (door) => {
      console.log(`Received prize door from server: ${door}`);
      setPrizeDoor(door);
    });
  }, []);

  useEffect(() => {
    if (currentNode.value === prizeDoor) {
      const name = prompt("Congratulations! You won! Please enter your name:");
      onWinnerSubmit(name);
    }
  }, [currentNode, prizeDoor, onWinnerSubmit]);

  return (
    <div>
      <p>Level {level}</p>
      <p>You are at room {currentNode.value}</p>
      {currentNode.left && (
        <button onClick={handleLeftDoor}>
          Go left to room {currentNode.left.value}
        </button>
      )}
      {currentNode.right && (
        <button onClick={handleRightDoor}>
          Go right to room {currentNode.right.value}
        </button>
      )}
      {level > 1 && <button onClick={handleGoBack}>Go back</button>}

      <div>
        <p>Previous rooms: </p>
        <ul>
          {previousNodes.map((node, index) => (
            <li key={index}>Room {node.value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default IndexPage;
