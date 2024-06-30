using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using System.Text.Json;

namespace Connect.Signal
{
    public class ConnectHub : Hub
    {
        private readonly RoomManager _roomManager;
        public ConnectHub(RoomManager roomManager)
        {
            _roomManager = roomManager;
        }

        public async Task onEnterWaitingRoom(string roomId)
        {
            Room? room = _roomManager.Rooms.Find(r => string.Equals(roomId, r.Id));

            List<string> clientsInRoom;

            if (room != null)
            {
                clientsInRoom = room.GetClientsInRoom();
            }
            else
            {
                //Room newRoom = new Room(Guid.NewGuid().ToString());
                Room newRoom = new Room(roomId);
                _roomManager.AddRoom(newRoom);

                clientsInRoom = new List<string>();
            }

            await Clients.Caller.SendAsync("onGetClientsInRoomFromWaitingRoom", JsonSerializer.Serialize(clientsInRoom));
        }

        public async Task onEnterRoom(string roomId)
        {
            Room? room = _roomManager.Rooms.Find(r => string.Equals(roomId, r.Id));

            if (room == null)
            {
                return;
            }

            List<string> clientsInRoom = room.GetClientsInRoom();

            if (!clientsInRoom.Exists(c => string.Equals(c, Context.ConnectionId)))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);
                await Clients.Caller.SendAsync("onGetClientsInRoomFromMeetingRoom", JsonSerializer.Serialize(clientsInRoom));

                room.AddClient(Context.ConnectionId);
                await Clients.OthersInGroup(roomId).SendAsync("onNewClientEnteredInRoom", Context.ConnectionId);
            }
        }


        public async Task onLeftRoom(string roomId)
        {
            Room? room = _roomManager.Rooms.Find(r => string.Equals(roomId, r.Id));

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

            await Clients.OthersInGroup(roomId).SendAsync("onClientLeftFromRoom", Context.ConnectionId);

            room?.RemoveClient(Context.ConnectionId);
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            foreach (Room room in _roomManager.Rooms)
            {
                if (room.ClientIds.Contains(Context.ConnectionId))
                {
                    Groups.RemoveFromGroupAsync(Context.ConnectionId, room.Id);

                    Clients.OthersInGroup(room.Id).SendAsync("onClientLeftFromRoom", Context.ConnectionId);

                    room.RemoveClient(Context.ConnectionId);
                }
            }

            return base.OnDisconnectedAsync(exception);
        }

        public async Task onStopShare(string roomId, string streamId)
        {
            await Clients.OthersInGroup(roomId).SendAsync("onStopShare", streamId);
        }

        public async Task offer(object offer, string receiverId)
        {
            await Clients.Client(receiverId).SendAsync("message", offer, Context.ConnectionId);
        }

        public async Task answer(object answer, string receiverId)
        {
            await Clients.Client(receiverId).SendAsync("message", answer, Context.ConnectionId);
        }

        public async Task newIceCandidate(object iceCandidate, string receiverId)
        {
            await Clients.Client(receiverId).SendAsync("message", iceCandidate, Context.ConnectionId);
        }
    }
}
