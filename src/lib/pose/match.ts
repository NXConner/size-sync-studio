import { PoseTemplate, JointAngleConstraint, BodyJoint } from '@/features/position-library/types';

export type MatchScore = {
  score: number; // 0..1, where 1 is perfect
  details: { id: string; delta: number; weight: number }[];
};

export function computeAngle(a: Point, b: Point, c: Point): number {
  // Angle at point b between vectors ba and bc
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magA = Math.hypot(abx, aby);
  const magC = Math.hypot(cbx, cby);
  if (magA === 0 || magC === 0) return 0;
  let ang = Math.acos(Math.min(1, Math.max(-1, dot / (magA * magC))));
  return (ang * 180) / Math.PI;
}

export type Point = { x: number; y: number };

export type Landmarks = Partial<Record<BodyJoint, Point>>;

export function scorePose(landmarks: Landmarks, template: PoseTemplate): MatchScore {
  const details: { id: string; delta: number; weight: number }[] = [];
  let totalWeight = 0;
  let weighted = 0;

  for (const c of template.constraints) {
    const weight = c.weight ?? 1;
    const angle = getConstraintAngle(c, landmarks);
    if (angle == null) continue;
    const mid = (c.window.min + c.window.max) / 2;
    const half = (c.window.max - c.window.min) / 2;
    const delta = Math.max(0, Math.abs(angle - mid) - half); // outside window => positive delta
    const contrib = 1 / (1 + delta); // simple falloff
    weighted += contrib * weight;
    totalWeight += weight;
    details.push({ id: c.id, delta, weight });
  }

  const score = totalWeight > 0 ? weighted / totalWeight : 0;
  return { score, details };
}

function getConstraintAngle(c: JointAngleConstraint, landmarks: Landmarks): number | null {
  if (c.joints.length !== 3) return null; // expect triplet (a,b,c)
  const [ja, jb, jc] = c.joints;
  const a = landmarks[ja];
  const b = landmarks[jb];
  const d = landmarks[jc];
  if (!a || !b || !d) return null;
  return computeAngle(a, b, d);
}
