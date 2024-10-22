﻿using System.Diagnostics;

namespace Connect.Signal
{
    public class RoomManager
    {
        public List<Room> Rooms { get; set; }

        public RoomManager()
        {
            Rooms = new List<Room>();
        }

        public void AddRoom(Room room)
        {
            Rooms.Add(room);
        }

        public void RemoveRoom(Room room)
        {
            Rooms.Remove(room);
        }

        public Room GetRoom(string roomId)
        {
            return Rooms.Find(r => string.Equals(roomId, r.Id));
        }

        public bool RoomExist(string roomId)
        {
            return Rooms.Exists(room => string.Equals(room.Id, roomId));
        }

    }
}
