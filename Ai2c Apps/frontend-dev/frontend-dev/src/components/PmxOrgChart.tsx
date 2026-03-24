import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Box, Card, CardContent, Chip, Skeleton, Typography, useTheme } from '@mui/material';

export type OrgNode = {
  id: string;
  name: string;
  title?: string;
  children?: OrgNode[];
  metaData?: OrgNode[];
};

type NodePosition = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const NodeCard: React.FC<{
  node: OrgNode;
  variant?: 'mos' | 'default';
  onClick?: () => void;
  selected?: boolean;
  showMOSCount?: boolean;
}> = ({ node, variant = 'default', onClick, selected, showMOSCount }) => {
  const theme = useTheme();
  const mosCount = node.metaData?.length ?? 0;
  const slCount = node.children?.length ?? 0;

  const getBackgroundColor = () => {
    if (!selected) return theme.palette.background.default;
    return theme.palette.mode === 'light' ? theme.palette.grey.l80 : theme.palette.grey.d80;
  };

  const getBorderColor = () => {
    return theme.palette.mode === 'light' ? theme.palette.grey.l40 : theme.palette.grey.d40;
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        minWidth: 100,
        textAlign: 'center',
        p: 1,
        backgroundColor: getBackgroundColor(),
        border: selected ? `2px solid ${theme.palette.primary.main}` : `2px solid ${getBorderColor()}`,
        borderRadius: 2,
        position: 'relative',
        zIndex: 3, // above SVG layers
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <CardContent sx={{ py: 1.25, px: 1.25 }}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          <Typography variant="h6">{node.name}</Typography>
          {variant !== 'mos' && showMOSCount && <Chip size="small" label={`${mosCount}`} variant="outlined" />}
          {variant === 'mos' && <Chip size="small" label={`${slCount}`} variant="outlined" />}
        </Box>
        {/* commenting out for now until better responsive design. */}
        {/* {node.title && <Typography variant="body2">{node.title}</Typography>} */}
      </CardContent>
    </Card>
  );
};

const MOSBox: React.FC<{
  metaData: OrgNode[];
  setNodeRef: (id: string) => (el: HTMLDivElement | null) => void;
  selectedMOSId: string | null;
  setSelectedMOSId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedSLId: string | null;
  setSelectedSLId: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ metaData, setNodeRef, selectedMOSId, setSelectedMOSId, selectedSLId, setSelectedSLId }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.grey.l40 : theme.palette.grey.d40}`,
        borderRadius: 2,
        p: 2,
        mt: 8,
        mb: 8,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        position: 'relative',
        zIndex: 1,
        flexWrap: 'wrap',
        alignSelf: 'center',
        maxWidth: '100%',
      }}
    >
      {metaData.length === 0 && (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          No MOS data.
        </Typography>
      )}

      {metaData.map((mos) => {
        const isSelected = selectedMOSId === mos.id;
        const slCount = mos.children?.length ?? 0;

        return (
          <Box key={mos.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Box ref={setNodeRef(mos.id)}>
              <NodeCard
                node={mos}
                variant="mos"
                onClick={() => {
                  setSelectedMOSId((prev) => (prev === mos.id ? null : mos.id));
                  setSelectedSLId(null);
                }}
                selected={isSelected}
              />
            </Box>

            {isSelected && slCount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                {mos.children!.map((sl) => {
                  return (
                    <Box key={sl.id} ref={setNodeRef(sl.id)}>
                      <NodeCard
                        node={sl}
                        selected={selectedSLId === sl.id}
                        onClick={() => {
                          setSelectedSLId(sl.id);
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const PmxOrgChart: React.FC<{
  data: OrgNode;
  grandparent?: OrgNode | null;
  loading: boolean;
  setSelectedMOS?: (val: string | null) => void;
  setSelectedSL?: (val: string | null) => void;
  setSelectedSubUnit?: (val: string | null) => void;
  setSelectedGrandparentUnit?: (val: boolean) => void;
}> = ({
  data,
  grandparent = null,
  setSelectedGrandparentUnit,
  setSelectedSubUnit,
  setSelectedMOS,
  setSelectedSL,
  loading,
}) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [positions, setPositions] = useState<NodePosition[]>([]);

  // Selection
  const [selectedGrandparent, setSelectedGrandparent] = useState<boolean>(false);
  const [selectedSubunitId, setSelectedSubunitId] = useState<string | null>(null);
  const [selectedMOSId, setSelectedMOSId] = useState<string | null>(null);
  const [selectedSLId, setSelectedSLId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMOS && setSelectedMOS(selectedMOSId);
    setSelectedSL && setSelectedSL(selectedSLId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMOSId, selectedSLId]);

  useEffect(() => {
    setSelectedGrandparentUnit && setSelectedGrandparentUnit(selectedGrandparent);
    setSelectedSubUnit && setSelectedSubUnit(selectedSubunitId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grandparent, selectedSubunitId]);

  // refs
  const setNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    nodeRefs.current[id] = el;
  };

  // layout
  const updatePositions = () => {
    const chartRect = chartRef.current?.getBoundingClientRect();
    if (!chartRect) return;
    const next: NodePosition[] = [];
    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      next.push({
        id,
        x: rect.left - chartRect.left,
        y: rect.top - chartRect.top,
        width: rect.width,
        height: rect.height,
      });
    });
    setPositions(next);
  };

  useLayoutEffect(() => {
    let raf = requestAnimationFrame(updatePositions);
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updatePositions);
    };
    window.addEventListener('resize', onResize);
    const root = chartRef.current;
    const ro = new ResizeObserver(onResize);
    if (root) ro.observe(root);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(raf);
  }, [data, grandparent, selectedGrandparent, selectedSubunitId, selectedMOSId, selectedSLId]);

  const posById = useMemo(() => {
    const map = new Map<string, NodePosition>();
    positions.forEach((p) => map.set(p.id, p));
    return map;
  }, [positions]);

  // helpers
  const centerX = (p: NodePosition) => p.x + p.width / 2;
  const topY = (p: NodePosition) => p.y;
  const bottomY = (p: NodePosition) => p.y + p.height;
  // Helper for elbow connector path (shortened)
  const orthoPath = (x1: number, y1: number, x2: number, y2: number) => {
    const down = y2 >= y1;
    const elbowOffset = 8; // smaller offset than before (was 12)
    const midY = down ? y1 + elbowOffset : y1 - elbowOffset;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  };

  // exactly one metadata context at a time
  const contextNode: OrgNode = useMemo(() => {
    if (selectedSubunitId) {
      const found = (data.children ?? []).find((c) => c.id === selectedSubunitId);
      return found ?? data;
    }
    if (selectedGrandparent && grandparent) return grandparent;
    return data;
  }, [data, grandparent, selectedGrandparent, selectedSubunitId]);

  const contextMeta: OrgNode[] = contextNode.metaData ?? [];

  useEffect(() => {
    // reset MOS/SL when switching context
    setSelectedMOSId(null);
    setSelectedSLId(null);
  }, [selectedGrandparent, selectedSubunitId]);

  // --------- Connectors (layered) ----------
  // LAYER 1: structure connectors behind everything
  const StructureConnectors = () => {
    const paths: React.JSX.Element[] = [];

    // Grandparent → Parent
    if (grandparent) {
      const gpPos = posById.get(grandparent.id);
      const parentPos = posById.get(data.id);
      if (gpPos && parentPos) {
        const xGP = centerX(gpPos);
        const yGPBottom = bottomY(gpPos);
        const yParentTop = topY(parentPos);
        const xParent = centerX(parentPos);
        paths.push(
          <path
            key="gp-to-parent"
            d={`M ${xGP} ${yGPBottom} L ${xGP} ${yParentTop - 20} L ${xParent} ${yParentTop - 20} L ${xParent} ${yParentTop}`}
            stroke={theme.palette?.mode === 'light' ? theme.palette.grey?.l40 : theme.palette.grey?.d40}
            strokeWidth={2}
            fill="none"
            strokeLinecap="square"
          />,
        );
      }
    }

    // Parent → Subunits
    const parentPos = posById.get(data.id);
    const subs = (data.children ?? []).map((c) => posById.get(c.id)).filter((p): p is NodePosition => !!p);

    if (parentPos && subs.length) {
      const subY = Math.min(...subs.map((p) => topY(p)));
      const barY = subY - 40;
      const xParent = centerX(parentPos);
      const yParentBottom = bottomY(parentPos);

      // drop from parent
      paths.push(
        <path
          key="parent-drop"
          d={`M ${xParent} ${yParentBottom} L ${xParent} ${barY}`}
          stroke={theme.palette?.mode === 'light' ? theme.palette.grey?.l40 : theme.palette.grey?.d40}
          strokeWidth={2}
          fill="none"
          strokeLinecap="square"
        />,
      );

      // bar
      const xStart = Math.min(...subs.map(centerX));
      const xEnd = Math.max(...subs.map(centerX));
      paths.push(
        <path
          key="sub-bar"
          d={`M ${xStart} ${barY} L ${xEnd} ${barY}`}
          stroke={theme.palette?.mode === 'light' ? theme.palette.grey?.l40 : theme.palette.grey?.d40}
          strokeWidth={2}
          fill="none"
          strokeLinecap="square"
        />,
      );

      // drops
      subs.forEach((sp, i) => {
        const x = centerX(sp);
        const yTopSub = topY(sp);
        paths.push(
          <path
            key={`sub-drop-${i}`}
            d={`M ${x} ${barY} L ${x} ${yTopSub}`}
            stroke={theme.palette?.mode === 'light' ? theme.palette.grey?.l40 : theme.palette.grey?.d40}
            strokeWidth={2}
            fill="none"
            strokeLinecap="square"
          />,
        );
      });
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {paths}
      </svg>
    );
  };

  // LAYER: Subunit -> its metadata box
  const SubunitMetaConnectors = () => {
    if (!selectedSubunitId) return null;
    const node = (data.children ?? []).find((c) => c.id === selectedSubunitId);
    if (!node || !node.metaData?.length) return null;

    const subPos = posById.get(node.id);
    const metaFirstId = node.metaData[0]?.id; // anchor to first MOS node
    const metaFirstPos = metaFirstId ? posById.get(metaFirstId) : null;
    if (!subPos || !metaFirstPos) return null;

    const x1 = centerX(subPos);
    const y1 = bottomY(subPos);
    const x2 = centerX(metaFirstPos);
    const y2 = topY(metaFirstPos);

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <path
          d={orthoPath(x1, y1, x2, y2)}
          stroke={theme.palette?.mode === 'light' ? theme.palette.grey?.l40 : theme.palette.grey?.d40}
          strokeWidth={2}
          fill="none"
          strokeLinecap="square"
        />
      </svg>
    );
  };

  // LAYER 3: MOS → Skill Levels (above visible MOS box)
  const MOSConnectors = () => {
    if (!selectedMOSId) return null;
    const mos = (contextMeta ?? []).find((m) => m.id === selectedMOSId);
    if (!mos) return null;

    const mosPos = posById.get(mos.id);
    if (!mosPos || !mos.children?.length) return null;

    const paths: React.JSX.Element[] = [];
    mos.children.forEach((sl) => {
      const slPos = posById.get(sl.id);
      if (!slPos) return;
      const x1 = centerX(mosPos);
      const y1 = bottomY(mosPos);
      const x2 = centerX(slPos);
      const y2 = topY(slPos);
      paths.push(
        <path
          key={`${mos.id}->${sl.id}`}
          d={orthoPath(x1, y1, x2, y2)}
          stroke={theme.palette?.mode === 'light' ? theme.palette.grey?.l40 : theme.palette.grey?.d40}
          strokeWidth={2}
          fill="none"
          strokeLinecap="square"
        />,
      );
    });

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        {paths}
      </svg>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap">
          {/* Simulate grandparent */}
          <Skeleton variant="rectangular" width={160} height={80} sx={{ borderRadius: 2 }} />

          {/* Simulate parent */}
          <Skeleton variant="rectangular" width={200} height={100} sx={{ borderRadius: 2 }} />

          {/* Simulate children */}
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" mt={4}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={140} height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Box>

          {/* Simulate MOS metadata */}
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" mt={6}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={120} height={60} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', p: 4 }} ref={chartRef}>
      {grandparent && grandparent?.id !== '' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            mb: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box ref={setNodeRef(grandparent.id)}>
            <NodeCard
              node={grandparent}
              selected={selectedGrandparent && !selectedSubunitId}
              showMOSCount
              onClick={() => {
                setSelectedGrandparent((prev) => !prev);
                setSelectedSubunitId(null); // ensure only one context
              }}
            />
          </Box>

          {/* Inline MOS box directly under grandparent when selected (and no subunit is selected) */}
          {selectedGrandparent && !selectedSubunitId && (
            <MOSBox
              metaData={grandparent.metaData ?? []}
              setNodeRef={setNodeRef}
              selectedMOSId={selectedMOSId}
              setSelectedMOSId={setSelectedMOSId}
              selectedSLId={selectedSLId}
              setSelectedSLId={setSelectedSLId}
            />
          )}
        </Box>
      )}

      {/* PARENT */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          mb: 6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          ref={setNodeRef(data.id)}
          onClick={() => {
            setSelectedGrandparent(false);
            setSelectedSubunitId(null);
          }}
        >
          <NodeCard node={data} selected={!selectedGrandparent && !selectedSubunitId} showMOSCount />
        </Box>

        {/* Inline MOS box directly under parent (only when no GP / subunit is selected) */}
        {!selectedGrandparent && !selectedSubunitId && (
          <MOSBox
            metaData={data.metaData ?? []}
            setNodeRef={setNodeRef}
            selectedMOSId={selectedMOSId}
            setSelectedMOSId={setSelectedMOSId}
            selectedSLId={selectedSLId}
            setSelectedSLId={setSelectedSLId}
          />
        )}
      </Box>

      {/* LAYER 1: structure connectors behind everything */}
      <StructureConnectors />

      {/* SUBUNITS (one may be selected; its MOS box appears right underneath it) */}
      {data.children && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            mb: 8,
            position: 'relative',
            zIndex: 1, // above structure connectors
            flexWrap: 'wrap',
          }}
        >
          {data.children.map((node) => {
            const isSelected = selectedSubunitId === node.id;
            return (
              <Box key={node.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <Box ref={setNodeRef(node.id)}>
                  <NodeCard
                    node={node}
                    selected={isSelected}
                    showMOSCount
                    onClick={() => {
                      setSelectedGrandparent(false);
                      setSelectedSubunitId((prev) => (prev === node.id ? null : node.id));
                    }}
                  />
                </Box>

                {isSelected && (
                  <MOSBox
                    metaData={node.metaData ?? []}
                    setNodeRef={setNodeRef}
                    selectedMOSId={selectedMOSId}
                    setSelectedMOSId={setSelectedMOSId}
                    selectedSLId={selectedSLId}
                    setSelectedSLId={setSelectedSLId}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
      <SubunitMetaConnectors />
      {/* LAYER 3: MOS connectors (above whichever MOS box is currently visible) */}
      <MOSConnectors />
    </Box>
  );
};

export default PmxOrgChart;
