import React, { useState, useEffect } from 'react';
import { Node, colors } from './components';
import { notification, Menu } from 'antd';
import graph from 'pagerank.js';

const RADIUS = 50;

type Node = {
  position: { x: number; y: number };
  id: number;
};

type Link = {
  from: number;
  to: number;
};

const defaultNodes: Node[] = [
  { position: { x: 50, y: 50 }, id: 0 },
  { position: { x: 300, y: 300 }, id: 1 },
  { position: { x: 360, y: 80 }, id: 2 },
  { position: { x: 70, y: 350 }, id: 3 },
  { position: { x: 600, y: 300 }, id: 4 },
  { position: { x: 370, y: 600 }, id: 5 }
];

const defaultLinks: Link[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 1, to: 4 },
  { from: 1, to: 5 },
  { from: 2, to: 0 },
  { from: 2, to: 4 },
  { from: 3, to: 0 },
  { from: 3, to: 5 },
  { from: 5, to: 2 }
];

const App = () => {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);

  const [links, setLinks] = useState<Link[]>(defaultLinks);

  const [selected, setSelected] = useState<number | undefined>(undefined);

  const [menuCoords, setMenuCoords] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  useEffect(() => {
    document.addEventListener('mousedown', (e: Event) => {
      if (e.target === document.body) {
        setSelected(undefined);
        setMenuCoords(undefined);
      }
    });
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      if (e.target === document.body)
        setMenuCoords({ x: e.clientX, y: e.clientY });
    });
  }, []);

  const addNode = () => {
    setNodes((prevNodes) => [
      ...prevNodes,
      { position: { x: menuCoords!.x, y: menuCoords!.y }, id: prevNodes.length }
    ]);
    setMenuCoords(undefined);
  };

  const contextMenu = (
    <Menu
      onClick={addNode}
      style={{
        position: 'absolute',
        top: (menuCoords && menuCoords.y) || 0,
        left: (menuCoords && menuCoords.x) || 0,
        boxShadow: '0 10px 15px 0 rgba(0,0,0,0.2)'
      }}
    >
      <Menu.Item>Add Node</Menu.Item>
    </Menu>
  );

  const handleRightClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: number
  ) => {
    e.preventDefault();
    if (selected !== undefined) {
      if (selected !== id) {
        const idx = links.findIndex(
          ({ from, to }) => from === selected && to === id
        );
        if (idx === -1) {
          setLinks((prevLinks) => [...prevLinks, { from: selected, to: id }]);
          notification.success({ message: 'Linked successfully' });
        } else {
          setLinks((prevLinks) => {
            const newLinks = [...prevLinks];
            newLinks.splice(idx, 1);
            return newLinks;
          });
          notification.success({ message: 'Linked removed successfully' });
        }
      }
      setSelected(undefined);
    } else setSelected(id);
  };

  graph.reset();

  links.forEach(({ from, to }) => {
    graph.link(from, to);
  });

  const ranks: string[] = [];
  graph.rank(0.81, 0.000001, (node: number, rank: number) => {
    ranks[node] = rank.toFixed(3);
  });

  const nodesComponent = nodes.map(({ position, id }, idx) => (
    <Node
      value={ranks[idx] || '0.000'}
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
      onContextMenu={(e) => {
        handleRightClick(e, id);
      }}
      selected={selected === id}
      key={idx}
    />
  ));

  const linksComponent = links.map(({ from, to }, idx) => {
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
        key={idx}
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
    <div>
      {nodesComponent}
      {linksComponent}
      {menuCoords ? contextMenu : null}
    </div>
  );
};

export default App;
