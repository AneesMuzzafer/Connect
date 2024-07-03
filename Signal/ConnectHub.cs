using Connect.Data;
using Connect.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;

namespace Connect.Signal
{
    public class ConnectHub : Hub
    {
        private readonly RoomManager _roomManager;
        private readonly ApplicationDbContext _dbContext;

        public ConnectHub(RoomManager roomManager, ApplicationDbContext dbContext)
        {
            _roomManager = roomManager;
            _dbContext = dbContext;
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
                Room newRoom = new Room(roomId);
                _roomManager.AddRoom(newRoom);

                clientsInRoom = new List<string>();
            }

            await Clients.Caller.SendAsync("onGetClientsInRoomFromWaitingRoom", JsonSerializer.Serialize(clientsInRoom));
        }

        public async Task onEnterRoom(string roomId)
        {
            Room? room = _roomManager.Rooms.Find(r => string.Equals(roomId, r.Id));
            Debug.WriteLine("On Enter room");

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

                Participant participant = new Participant()
                {
                    UserId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier),
                    MeetingId = _roomManager.GetRoom(roomId).MeetingId,
                    JoinedAt = DateTime.Now
                };

                Debug.WriteLine($"Participant: {participant.UserId} - {participant.MeetingId}");

                _dbContext.Participants.Add(participant);

                await _dbContext.SaveChangesAsync();
            }
        }


        public async Task onLeftRoom(string roomId)
        {
            Room? room = _roomManager.Rooms.Find(r => string.Equals(roomId, r.Id));

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

            await Clients.OthersInGroup(roomId).SendAsync("onClientLeftFromRoom", Context.ConnectionId);

            room?.RemoveClient(Context.ConnectionId);

            if (room?.ClientIds.Count < 1)
            {
                var meetingId = _roomManager.GetRoom(roomId).MeetingId;
                Meeting meeting = _dbContext.Meetings.FirstOrDefault(m => m.Id == meetingId);

                meeting.EndedAt = DateTime.Now;

                _dbContext.Meetings.Update(meeting);
                await _dbContext.SaveChangesAsync();

                _roomManager.Rooms.Remove(room);
            }
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            foreach (Room room in _roomManager.Rooms.ToList())
            {
                if (room.ClientIds.Contains(Context.ConnectionId))
                {
                    Groups.RemoveFromGroupAsync(Context.ConnectionId, room.Id);

                    Clients.OthersInGroup(room.Id).SendAsync("onClientLeftFromRoom", Context.ConnectionId);

                    room.RemoveClient(Context.ConnectionId);

                    if (room?.ClientIds.Count < 1)
                    {
                        var meetingId = _roomManager.GetRoom(room.Id).MeetingId;
                        Meeting meeting = _dbContext.Meetings.FirstOrDefault(m => m.Id == meetingId);

                        meeting.EndedAt = DateTime.Now;

                        _dbContext.Meetings.Update(meeting);
                        _dbContext.SaveChangesAsync();

                        _roomManager.Rooms.Remove(room);
                    }
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
