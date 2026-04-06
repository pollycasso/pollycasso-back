export interface RoomUpdatePlayerChanges {
  isReady?: boolean;
  isConnected?: boolean;
}

export interface RoomUpdatePlayerPayload {
  userId: number;
  changes: RoomUpdatePlayerChanges;
}
