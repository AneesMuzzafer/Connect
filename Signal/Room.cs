namespace Connect.Signal
{
    public class Room
    {
        public string Id { get; set; }
        public int MeetingId { get; set; }

        public List<string> ClientIds { get; set; }

        public Room(string id)
        {
            Id = id;
            ClientIds = new List<string>();
        }

        public void SetMeetingId(int meetingId)
        {
            MeetingId = meetingId;
        }

        public void AddClient(string connectionId)
        {
            ClientIds.Add(connectionId);
        }

        public void RemoveClient(string connectionId)
        {
            ClientIds.Remove(connectionId);
        }

        public List<string> GetClientsInRoom()
        {
            return ClientIds;
        }
    }
}
