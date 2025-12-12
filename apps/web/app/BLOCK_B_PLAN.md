# Block B: Offline-First + CRDT Architecture Plan

**Status**: Planning Phase (No Code Yet)
**Timeline**: Phase 2 of development
**Target**: Real-time collaboration with offline support

---

## Overview

Block B implements an offline-first architecture with Conflict-Free Replicated Data Type (CRDT) synchronization. This enables:

- ✓ Full offline functionality (read/write when disconnected)
- ✓ Automatic sync when online
- ✓ Real-time multi-user collaboration without conflicts
- ✓ Zero data loss - all changes preserved and synced
- ✓ Optimistic UI updates
- ✓ Works across tabs and browser sessions

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
│  (React + React Router)                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────────┐   ┌──────────────┐  ┌──────────────┐
   │  UI Layer   │   │  CRDT Engine │  │ Offline DB   │
   │  (Pages)    │   │  (Yjs/Custom)│  │  (IndexedDB) │
   └──────┬──────┘   └──────┬───────┘  └──────┬───────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌──────────┐    ┌─────────────────┐   ┌───────────┐
   │ Local    │    │   Change Queue  │   │ Sync      │
   │ Cache    │    │   (IndexedDB)   │   │ Manager   │
   │ Layer    │    │   + Memory      │   │ (WebSocket│
   └────┬─────┘    └────────┬────────┘   │  & REST)  │
        │                   │             └──────┬────┘
        └───────────────────┼────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Network       │
                   │   Detection     │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  Backend Server │
                   │  (Postgres)     │
                   └─────────────────┘
```

---

## Phase 1: Data Storage (Local Persistence)

### 1.1 IndexedDB Schema

Store three main stores:

```javascript
// Stores structure:
{
  "entities": {
    // Main data: projects, issues, comments, labels
    keyPath: "id",
    indexes: [
      { name: "projectId", keyPath: "projectId", unique: false },
      { name: "issueId", keyPath: "issueId", unique: false },
      { name: "createdAt", keyPath: "createdAt", unique: false },
      { name: "status", keyPath: "status", unique: false }
    ]
  },

  "changes": {
    // Change log for CRDT
    keyPath: "id",  // Unique change ID: `${timestamp}-${actorId}-${sequence}`
    indexes: [
      { name: "entityType", keyPath: "entityType", unique: false },
      { name: "entityId", keyPath: "entityId", unique: false },
      { name: "timestamp", keyPath: "timestamp", unique: false },
      { name: "synced", keyPath: "synced", unique: false }
    ]
  },

  "metadata": {
    // Sync state and clock info
    keyPath: "key",
    data: {
      "lastSyncTime": timestamp,
      "vectorClock": { actorId: 0, ... },
      "isOnline": boolean,
      "pendingChanges": count
    }
  }
}
```

### 1.2 Implementation Steps

1. Create IndexedDB initialization utility:
   ```typescript
   // db/indexeddb.ts
   - initializeIndexedDB()
   - dropDatabase()
   - getStore(storeName)
   - transactions management
   ```

2. Create data access layer:
   ```typescript
   // db/local.ts
   - getEntity(id)
   - saveEntity(entity)
   - deleteEntity(id)
   - queryEntities(filter)
   - updateMultiple(entities)
   - getChanges(since)
   ```

3. Wrap current models with offline support:
   ```typescript
   // models/offline-project.server.ts
   // models/offline-issue.server.ts
   // - Automatically save to IndexedDB on create/update
   // - Fall back to IndexedDB if server fails
   ```

---

## Phase 2: CRDT Implementation

### 2.1 Vector Clocks (Causality Tracking)

Every client maintains a vector clock to track causality:

```javascript
// Actor: unique client identifier
actorId = "user-123-browser-abc"

// Vector Clock: tracks causality
vectorClock = {
  "user-123-browser-abc": 5,
  "user-456-browser-def": 3,
  "user-789-browser-ghi": 1,
  "server": 12
}

// Change metadata
change = {
  id: "1702345600000-user-123-browser-abc-5",  // Unique change ID
  timestamp: 1702345600000,
  actor: "user-123-browser-abc",
  sequence: 5,
  clock: { "user-123-browser-abc": 5, ... },
  operation: { type: "set", path: ["issues", 42, "status"], value: "done" }
}
```

### 2.2 Operations (Atomic Changes)

Define operation types:

```javascript
// SET: Create/update field
{
  type: "set",
  path: ["projects", 1, "name"],
  value: "New Project Name",
  timestamp: 1702345600000,
  actor: "user-123"
}

// DELETE: Remove entity
{
  type: "delete",
  path: ["issues", 42],
  timestamp: 1702345600000,
  actor: "user-123"
}

// LIST_INSERT: Add item to list
{
  type: "list-insert",
  path: ["issues", 42, "labels"],
  index: 0,
  value: { id: 5, name: "bug", color: "#ff0000" },
  timestamp: 1702345600000,
  actor: "user-123"
}

// LIST_DELETE: Remove from list
{
  type: "list-delete",
  path: ["issues", 42, "labels"],
  index: 0,
  timestamp: 1702345600000,
  actor: "user-123"
}

// INCREMENT: Atomic counter increment
{
  type: "increment",
  path: ["issues", 42, "viewCount"],
  value: 1,
  timestamp: 1702345600000,
  actor: "user-123"
}
```

### 2.3 Conflict-Free Merge Algorithm

```javascript
/**
 * When two operations A and B have the same path but were made concurrently:
 * - If A.timestamp < B.timestamp: Apply A then B
 * - If A.timestamp === B.timestamp: Use actor ID as tiebreaker
 * - Different paths: Always apply both (no conflict)
 */

// Example conflict:
A = { type: "set", path: ["issues", 1, "status"], value: "done", ts: 1000, actor: "user-a" }
B = { type: "set", path: ["issues", 1, "status"], value: "in_progress", ts: 1000, actor: "user-b" }

// Resolution: actor "user-b" > "user-a" alphabetically
// Result: status = "in_progress"

// Merge function:
function merge(base, local, remote) {
  // base: common ancestor state
  // local: local changes
  // remote: remote changes
  
  const allChanges = [...local, ...remote].sort((a, b) => {
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    return a.actor.localeCompare(b.actor);
  });
  
  let result = base;
  for (const change of allChanges) {
    result = applyChange(result, change);
  }
  return result;
}
```

### 2.4 Implementation Steps

1. Create CRDT engine:
   ```typescript
   // crdt/engine.ts
   - class CRDTEngine
   - method: applyChange(change): void
   - method: applyChanges(changes): void
   - method: merge(remoteChanges): void
   - method: getChanges(since): Change[]
   - method: getCurrentState(): State
   ```

2. Implement operation application:
   ```typescript
   // crdt/operations.ts
   - applyOperation(state, op): newState
   - reverseOperation(op): reverseOp (for undo)
   - isConcurrent(op1, op2): boolean
   ```

3. Implement vector clock logic:
   ```typescript
   // crdt/clock.ts
   - class VectorClock
   - method: increment(actor)
   - method: merge(other)
   - method: happensBefore(other): boolean
   - method: isConcurrent(other): boolean
   ```

4. Update useOfflineState and useCRDT hooks:
   ```typescript
   // hooks/useOfflineState.ts
   - Integrate CRDT engine
   - Auto-persist to IndexedDB
   - Sync change log

   // hooks/useCRDT.ts
   - Use VectorClock for causality
   - Implement 3-way merge
   - Change history management
   ```

---

## Phase 3: Synchronization

### 3.1 Change Queue & Sync Manager

```javascript
// Sync flow:

CLIENT STATE                    SERVER STATE
┌──────────────────┐           ┌──────────────────┐
│ Local Changes    │           │ Database         │
│ [change1, ...]   │           │                  │
└────────┬─────────┘           └────────┬─────────┘
         │                              │
         │ Online?                      │
         ├─────Yes─────┐               │
         │             │               │
         ▼             ▼               ▼
    ┌─────────────────────────────────────┐
    │ 1. Send pending changes (since last │
    │    sync clock)                      │
    │ 2. Receive remote changes           │
    │ 3. Apply remote changes locally     │
    │ 4. Merge if conflicts               │
    │ 5. Update vector clock              │
    │ 6. Mark changes as synced           │
    └─────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ Sync complete, update UI │
    └──────────────────────────┘
```

### 3.2 Implementation Steps

1. Create sync manager:
   ```typescript
   // sync/manager.ts
   - class SyncManager
   - method: enqueuChange(change)
   - method: sync(): Promise
   - method: handleOnline()
   - method: handleOffline()
   - method: applyRemoteChanges(changes)
   - retry logic with exponential backoff
   ```

2. Update API layer:
   ```typescript
   // api/sync.ts
   - POST /api/sync/changes
     Body: { changes, vectorClock, actorId }
     Response: { changes: remoteChanges, vectorClock }
   - GET /api/sync/status
   - POST /api/sync/full-state (for new clients)
   ```

3. Network state management:
   ```typescript
   // sync/network.ts
   - useNetworkStatus(): { isOnline, lastOnline }
   - Emit events when status changes
   - Listen to online/offline events
   ```

4. Add sync indicators to UI:
   ```typescript
   // components/SyncIndicator.tsx
   - Shows: "Synced", "Syncing...", "Offline", "Pending X changes"
   - Color coded: green (synced), yellow (syncing), red (offline)
   ```

---

## Phase 4: API Endpoints

### 4.1 Server-Side Sync API

```typescript
// POST /api/sync/changes
Request: {
  changes: [
    {
      id: "1702345600000-user-123-abc-5",
      timestamp: 1702345600000,
      actor: "user-123-browser-abc",
      clock: { "user-123-browser-abc": 5, ... },
      operation: { type: "set", path: [...], value: ... }
    },
    ...
  ],
  vectorClock: { "user-123-browser-abc": 5, ... },
  actorId: "user-123-browser-abc"
}

Response: {
  success: true,
  changes: [
    // Remote changes from other clients since last sync
    {
      id: "1702345610000-user-456-def-3",
      timestamp: 1702345610000,
      actor: "user-456-browser-def",
      clock: { "user-456-browser-def": 3, ... },
      operation: { type: "set", path: [...], value: ... }
    },
    ...
  ],
  vectorClock: { "user-123-browser-abc": 5, "user-456-browser-def": 3, ... },
  lastSyncedAt: "2024-12-12T10:30:00Z"
}
```

### 4.2 Fallback Strategy (No CRDT on Server)

If server doesn't support CRDT initially:

```typescript
// Incremental sync via timestamps
POST /api/sync/since
Query: { since: "2024-12-12T10:00:00Z", entity_type: "issue" }

Response: {
  changes: [
    { type: "created", entity: Issue, timestamp: "2024-12-12T10:15:00Z" },
    { type: "updated", entity: Issue, timestamp: "2024-12-12T10:20:00Z" },
    { type: "deleted", entity_id: 42, entity_type: "issue", timestamp: "2024-12-12T10:25:00Z" }
  ],
  lastTimestamp: "2024-12-12T10:30:00Z"
}
```

---

## Phase 5: Conflict Resolution Strategies

### 5.1 Built-in Strategies

```typescript
// 1. Last-Write-Wins (LWW)
conflict.timestamp > base.timestamp ? conflict : base

// 2. Commutative Operations (for specific fields)
// Example: viewCount++ is commutative, always apply both

// 3. Custom Merge Function
(local, remote, base) => {
  // Application-specific logic
  if (remote.status === "done" && local.status === "in_progress") {
    return remote; // Respect completion
  }
  return local;
}

// 4. Undo-Redo Conflict Resolution
// Preserve user's explicit actions, undo others' concurrent changes if conflicting

// 5. Priority-Based
// Admin changes > User changes > Bot changes
```

### 5.2 Conflict Resolution UI

```typescript
// ConflictResolver component
// Display when concurrent changes detected:
// - Show both versions
// - Let user choose or merge manually
// - Log decision for audit trail
```

---

## Phase 6: State Hydration

### 6.1 Initialization Flow

```
New Client Connects
        │
        ├─→ Check IndexedDB for cached state
        │   └─→ Found? Load from cache + fetch changes since lastSync
        │   └─→ Not found? Do full sync
        │
        ├─→ Request full state from server (if needed)
        │   └─→ POST /api/sync/full-state
        │
        ├─→ Merge server state with local changes
        │
        ├─→ Update vector clock
        │
        └─→ Ready for offline/online operation
```

### 6.2 Implementation

```typescript
// sync/hydration.ts
- async loadInitialState()
  1. Try IndexedDB
  2. If empty or outdated, fetch full state
  3. Merge with pending local changes
  4. Update metadata
  5. Initialize CRDT engine
  6. Start sync loops
```

---

## Phase 7: Real-Time Sync (WebSocket)

### 7.1 Optional WebSocket Layer

For real-time collaboration:

```typescript
// ws/RealtimeClient
- Connect to WebSocket server
- Subscribe to entity changes: SUBSCRIBE "issue:1:changes"
- Receive remote changes in real-time
- Update local state immediately
- Emit events for UI updates
- Auto-reconnect with backoff
```

### 7.2 Server-Side WebSocket Handler

```typescript
// Broadcast changes to all connected clients
// Except the originating client (it already updated)
server.on("change", (change) => {
  for (const client of connectedClients) {
    if (client.actorId !== change.actor) {
      client.send(change);
    }
  }
  // Also save to database
  persistChange(change);
});
```

---

## Phase 8: Testing Strategy

### 8.1 Unit Tests

```typescript
// __tests__/crdt.test.ts
- Test operation application
- Test vector clock logic
- Test merge scenarios

// __tests__/offline-state.test.ts
- Test state updates offline
- Test sync on reconnect
- Test conflict resolution
```

### 8.2 Integration Tests

```typescript
// __tests__/sync.integration.test.ts
- Simulate offline period
- Simulate concurrent changes
- Verify eventual consistency
- Test recovery from connection loss
```

### 8.3 E2E Tests

```typescript
// cypress/e2e/offline.cy.ts
- Create project while offline
- Go online, verify sync
- Multiple tabs simultaneously
- Conflict scenarios with real users
```

---

## Performance Considerations

### 8.1 Optimization

1. **Change Batching**: Batch multiple changes before sending
2. **Compression**: Compress change logs before storing
3. **Indexes**: Create indexes on frequently queried fields
4. **Pagination**: Load changes in chunks, not all at once
5. **Deduplication**: Don't send same change twice

### 8.2 Storage Management

```typescript
// Cleanup strategies
- Delete synced changes after 7 days
- Archive completed issues
- Compress old change logs
- Maintain configurable retention policy
```

---

## Security Considerations

### 9.1 Encryption

```typescript
// Encrypt sensitive data in IndexedDB
- Project descriptions
- Issue details
- Comments
- Use IndexedDB encryption libraries
```

### 9.2 Access Control

```typescript
// Verify permissions on sync
- Only sync changes for accessible projects/issues
- Verify user has edit permission
- Log all changes with user ID
- Implement audit trail
```

---

## Migration Path from REST to CRDT

### 10.1 Hybrid Approach (Recommended)

```
Phase 1: Current REST API (Block A)
├─ Works fully online
├─ No offline support
└─ Basic database

Phase 2: Add offline layer (Block B)
├─ Keep REST API
├─ Add IndexedDB caching
├─ Store changes locally
├─ Sync on reconnect
├─ No CRDT yet

Phase 3: Optional full CRDT (Future)
├─ Implement CRDT engine
├─ Add vector clocks
├─ Multi-user real-time sync
├─ Server-side CRDT storage
└─ WebSocket for real-time
```

### 10.2 Backward Compatibility

- Old clients use REST API only
- New clients use REST + CRDT
- Server handles both transparently
- Graceful upgrade path

---

## Implementation Timeline

| Phase | Component | Effort | Timeline |
|-------|-----------|--------|----------|
| 1 | IndexedDB layer | 2 weeks | Week 1-2 |
| 2 | useOfflineState hook | 1 week | Week 3 |
| 3 | CRDT engine | 3 weeks | Week 4-6 |
| 4 | useCRDT hook | 1 week | Week 7 |
| 5 | Sync manager | 2 weeks | Week 8-9 |
| 6 | API endpoints | 1 week | Week 10 |
| 7 | State hydration | 1 week | Week 11 |
| 8 | WebSocket (optional) | 2 weeks | Week 12-13 |
| 9 | Testing | 2 weeks | Week 14-15 |
| 10 | Polish + docs | 1 week | Week 16 |

**Total Estimated Timeline**: 4 months

---

## Success Metrics

- ✓ Works fully offline (read/write)
- ✓ Zero data loss with auto-sync
- ✓ No conflicts in UI
- ✓ <100ms perceived latency (optimistic updates)
- ✓ <5MB IndexedDB storage per user
- ✓ Sync completes within 2 seconds (typical)
- ✓ 99.9% eventual consistency
- ✓ Full audit trail of changes

---

## References

- **Yjs**: https://docs.yjs.dev/ (Production CRDT library)
- **Automerge**: https://automerge.org/ (Academic JSON CRDT)
- **CRDT Papers**: https://crdt.tech/ (Research)
- **Local-first Software**: https://www.inkandswitch.com/local-first/ (Philosophy)
- **Sync Strategies**: https://remotestorage.io/ (WebSync protocol)

---

## Questions for Team

1. Should we build custom CRDT or use library (Yjs)?
2. Do we need real-time WebSocket or REST polling is OK?
3. What's acceptable storage limit in IndexedDB?
4. What's SLA for sync on poor connection?
5. Should conflicts show UI resolution dialog or auto-resolve?

---

**Next Steps**:
- [ ] Get team approval for architecture
- [ ] Create detailed implementation specs for each phase
- [ ] Set up development environment for Block B
- [ ] Start Phase 1: IndexedDB layer
