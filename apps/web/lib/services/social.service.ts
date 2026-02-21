import { getDataSource, User, FollowEdge } from "@meusdesafios/db";
import type { ExploreUser, FriendSummary, PendingFollowRequest, SentFollowRequest } from "../types/social";

// ── getFriendCount ────────────────────────────────────────

export async function getFriendCount(
  userId: string
): Promise<{ friendsCount: number }> {
  const ds = await getDataSource();
  const edgeRepo = ds.getRepository(FollowEdge);

  const friendsCount = await edgeRepo
    .createQueryBuilder("e")
    .where("e.status = :status", { status: "accepted" })
    .andWhere(
      "(e.requester_id = :userId OR e.target_id = :userId)",
      { userId }
    )
    .getCount();

  return { friendsCount };
}

// ── getAcceptedFriends ────────────────────────────────────

export async function getAcceptedFriends(
  userId: string
): Promise<FriendSummary[]> {
  const ds = await getDataSource();
  const edgeRepo = ds.getRepository(FollowEdge);

  const edges = await edgeRepo
    .createQueryBuilder("e")
    .leftJoinAndSelect("e.requester", "requester")
    .leftJoinAndSelect("e.target", "target")
    .where("e.status = :status", { status: "accepted" })
    .andWhere(
      "(e.requester_id = :userId OR e.target_id = :userId)",
      { userId }
    )
    .orderBy("e.updated_at", "DESC")
    .getMany();

  return edges
    .map((e) => {
      const friend = e.requesterId === userId ? e.target : e.requester;
      if (!friend) return null;
      return {
        id: friend.id,
        displayName: friend.displayName,
        handle: friend.handle,
        avatarUrl: friend.avatarUrl,
      };
    })
    .filter((f): f is FriendSummary => f !== null);
}

// ── searchUsers ───────────────────────────────────────────

export async function searchUsers(
  currentUserId: string,
  query: string,
  limit = 20
): Promise<ExploreUser[]> {
  const ds = await getDataSource();
  const userRepo = ds.getRepository(User);
  const edgeRepo = ds.getRepository(FollowEdge);

  const users = await userRepo
    .createQueryBuilder("u")
    .where("u.is_active = true")
    .andWhere("u.id != :currentUserId", { currentUserId })
    .andWhere(
      "(u.handle ILIKE :q OR u.display_name ILIKE :q)",
      { q: `%${query}%` }
    )
    .orderBy("u.display_name", "ASC")
    .limit(limit)
    .getMany();

  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);

  // Edges where current user is requester (outgoing)
  const outgoing = await edgeRepo
    .createQueryBuilder("e")
    .where("e.requester_id = :currentUserId", { currentUserId })
    .andWhere("e.target_id IN (:...userIds)", { userIds })
    .getMany();

  // Edges where current user is target (incoming)
  const incoming = await edgeRepo
    .createQueryBuilder("e")
    .where("e.target_id = :currentUserId", { currentUserId })
    .andWhere("e.requester_id IN (:...userIds)", { userIds })
    .getMany();

  const outMap = new Map(outgoing.map((e) => [e.targetId, e.status]));
  const inMap = new Map(incoming.map((e) => [e.requesterId, e.status]));

  return users
    .filter((u) => {
      // Exclude blocked users in either direction
      return outMap.get(u.id) !== "blocked" && inMap.get(u.id) !== "blocked";
    })
    .map((u) => ({
      id: u.id,
      displayName: u.displayName,
      handle: u.handle,
      avatarUrl: u.avatarUrl,
      followStatus: outMap.get(u.id) ?? inMap.get(u.id),
    }));
}

// ── getSuggestedUsers ─────────────────────────────────────

export async function getSuggestedUsers(
  currentUserId: string,
  limit = 10
): Promise<ExploreUser[]> {
  const ds = await getDataSource();
  const userRepo = ds.getRepository(User);

  const users = await userRepo
    .createQueryBuilder("u")
    .where("u.is_active = true")
    .andWhere("u.id != :currentUserId", { currentUserId })
    .andWhere(
      `u.id NOT IN (
        SELECT e.target_id FROM follow_edges e WHERE e.requester_id = :currentUserId
        UNION
        SELECT e.requester_id FROM follow_edges e WHERE e.target_id = :currentUserId
      )`,
      { currentUserId }
    )
    .orderBy("u.created_at", "DESC")
    .limit(limit)
    .getMany();

  return users.map((u) => ({
    id: u.id,
    displayName: u.displayName,
    handle: u.handle,
    avatarUrl: u.avatarUrl,
  }));
}

// ── getPendingRequests ────────────────────────────────────

export async function getPendingRequests(
  currentUserId: string
): Promise<PendingFollowRequest[]> {
  const ds = await getDataSource();
  const edgeRepo = ds.getRepository(FollowEdge);

  const edges = await edgeRepo
    .createQueryBuilder("e")
    .leftJoinAndSelect("e.requester", "requester")
    .where("e.target_id = :currentUserId", { currentUserId })
    .andWhere("e.status = :status", { status: "pending" })
    .orderBy("e.created_at", "DESC")
    .getMany();

  return edges
    .filter((e) => e.requester != null)
    .map((e) => ({
      edgeId: e.id,
      requesterId: e.requesterId,
      displayName: e.requester.displayName,
      handle: e.requester.handle,
      avatarUrl: e.requester.avatarUrl,
      createdAt: e.createdAt.toISOString(),
    }));
}

// ── getSentPendingRequests ─────────────────────────────────

export async function getSentPendingRequests(
  currentUserId: string
): Promise<SentFollowRequest[]> {
  const ds = await getDataSource();
  const edgeRepo = ds.getRepository(FollowEdge);

  const edges = await edgeRepo
    .createQueryBuilder("e")
    .leftJoinAndSelect("e.target", "target")
    .where("e.requester_id = :currentUserId", { currentUserId })
    .andWhere("e.status = :status", { status: "pending" })
    .orderBy("e.created_at", "DESC")
    .getMany();

  return edges
    .filter((e) => e.target != null)
    .map((e) => ({
      edgeId: e.id,
      targetId: e.targetId,
      displayName: e.target.displayName,
      handle: e.target.handle,
      avatarUrl: e.target.avatarUrl,
      createdAt: e.createdAt.toISOString(),
    }));
}

// ── cancelFollowRequest ──────────────────────────────────

export async function cancelFollowRequest(
  currentUserId: string,
  edgeId: string
): Promise<void> {
  const ds = await getDataSource();
  const edgeRepo = ds.getRepository(FollowEdge);

  const edge = await edgeRepo.findOne({
    where: { id: edgeId, requesterId: currentUserId, status: "pending" },
  });
  if (!edge) {
    throw new Error("Friend request not found");
  }

  await edgeRepo.remove(edge);
}

// ── sendFollowRequest ─────────────────────────────────────

export async function sendFollowRequest(
  requesterId: string,
  targetHandle: string
): Promise<{ edgeId: string }> {
  const ds = await getDataSource();
  const userRepo = ds.getRepository(User);
  const edgeRepo = ds.getRepository(FollowEdge);

  const target = await userRepo.findOne({
    where: { handle: targetHandle, isActive: true },
  });
  if (!target) {
    throw new Error("User not found");
  }
  if (target.id === requesterId) {
    throw new Error("Cannot add yourself");
  }

  // Check for existing edge in either direction
  const existingOutgoing = await edgeRepo.findOne({
    where: { requesterId, targetId: target.id },
  });

  if (existingOutgoing) {
    if (existingOutgoing.status === "blocked") {
      throw new Error("Cannot add this user");
    }
    if (existingOutgoing.status === "pending" || existingOutgoing.status === "accepted") {
      return { edgeId: existingOutgoing.id };
    }
    if (existingOutgoing.status === "denied") {
      existingOutgoing.status = "pending";
      await edgeRepo.save(existingOutgoing);
      return { edgeId: existingOutgoing.id };
    }
  }

  // Check incoming edge from the target
  const existingIncoming = await edgeRepo.findOne({
    where: { requesterId: target.id, targetId: requesterId },
  });
  if (existingIncoming?.status === "blocked") {
    throw new Error("Cannot add this user");
  }

  // Auto-accept: if the target already sent us a pending request, become friends instantly
  if (existingIncoming?.status === "pending") {
    existingIncoming.status = "accepted";
    await edgeRepo.save(existingIncoming);
    return { edgeId: existingIncoming.id };
  }

  const edge = edgeRepo.create({
    requesterId,
    targetId: target.id,
    status: "pending",
  });
  await edgeRepo.save(edge);
  return { edgeId: edge.id };
}

// ── acceptFollowRequest ───────────────────────────────────

export async function acceptFollowRequest(
  currentUserId: string,
  edgeId: string
): Promise<void> {
  const ds = await getDataSource();
  const edgeRepo = ds.getRepository(FollowEdge);

  const edge = await edgeRepo.findOne({
    where: { id: edgeId, targetId: currentUserId, status: "pending" },
  });
  if (!edge) {
    throw new Error("Friend request not found");
  }

  edge.status = "accepted";
  await edgeRepo.save(edge);
}

// ── denyFollowRequest ─────────────────────────────────────

export async function denyFollowRequest(
  currentUserId: string,
  edgeId: string
): Promise<void> {
  const ds = await getDataSource();
  const edgeRepo = ds.getRepository(FollowEdge);

  const edge = await edgeRepo.findOne({
    where: { id: edgeId, targetId: currentUserId, status: "pending" },
  });
  if (!edge) {
    throw new Error("Friend request not found");
  }

  edge.status = "denied";
  await edgeRepo.save(edge);
}
