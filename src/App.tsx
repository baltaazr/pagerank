import React, { useState } from 'react';
import { Node, colors } from './components';

const RADIUS = 50;

type Node = {
  position: { x: number; y: number };
  id: number;
  rank?: number;
};

type Link = {
  from: number;
  to: number;
};

const App = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { position: { x: 100, y: 100 }, id: 0 },
    { position: { x: 50, y: 200 }, id: 1 }
  ]);

  const [links, setLinks] = useState<Link[]>([{ from: 0, to: 1 }]);

  const nodesComponent = nodes.map(({ position, rank, id }, idx) => (
    <Node
      value={rank || 0}
      id={id}
      colorIdx={idx % colors.length}
      position={position}
      radius={RADIUS}
      onDrag={(e, data) => {
        const { x, y } = data;
        const newNodes = [...nodes];
        const idx = newNodes.findIndex(({ id: nodeId }) => nodeId === id);
        newNodes[idx] = { ...newNodes[idx], position: { x, y } };
        setNodes(newNodes);
      }}
    />
  ));

  const linksComponent = links.map(({ from, to }) => {
    const startNode = nodes.find(({ id }) => id === from);
    const endNode = nodes.find(({ id }) => id === to);

    if (!startNode || !endNode) return <></>;

    const {
      position: { x: x1, y: y1 }
    } = startNode;
    const {
      position: { x: x2, y: y2 }
    } = endNode;

    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
        style={{ position: 'absolute', top: 0, zIndex: -1 }}
      >
        <defs>
          <marker
            id='arrowhead'
            markerWidth='10'
            markerHeight='7'
            refX={RADIUS + 10}
            refY='3.5'
            orient='auto'
          >
            <polygon points='0 0, 10 3.5, 0 7' />
          </marker>
        </defs>
        <line
          x1={x1 + RADIUS}
          y1={y1 + RADIUS}
          x2={x2 + RADIUS}
          y2={y2 + RADIUS}
          stroke='#000'
          strokeWidth='1'
          markerEnd='url(#arrowhead)'
        />
      </svg>
    );
  });

  return (
    <div className='App'>
      {nodesComponent}
      {linksComponent}
    </div>
  );
};

export default App;
